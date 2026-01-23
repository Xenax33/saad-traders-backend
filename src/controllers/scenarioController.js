import { PrismaClient } from '@prisma/client';
import { AppError, catchAsync } from '../utils/errors.js';

const prisma = new PrismaClient();

// Admin APIs - Manage Global Scenarios

export const createGlobalScenario = catchAsync(async (req, res, next) => {
  const { scenarioCode, scenarioDescription } = req.body;

  // Check if scenario code already exists
  const existingScenario = await prisma.globalScenario.findUnique({
    where: { scenarioCode },
  });

  if (existingScenario) {
    throw new AppError('Scenario code already exists', 400);
  }

  const scenario = await prisma.globalScenario.create({
    data: {
      scenarioCode,
      scenarioDescription,
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      scenario,
    },
  });
});

export const getAllGlobalScenarios = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 50, search } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const take = parseInt(limit);

  const where = {};

  if (search) {
    where.OR = [
      { scenarioCode: { contains: search, mode: 'insensitive' } },
      { scenarioDescription: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [scenarios, total] = await Promise.all([
    prisma.globalScenario.findMany({
      where,
      skip,
      take,
      orderBy: {
        scenarioCode: 'asc',
      },
    }),
    prisma.globalScenario.count({ where }),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      scenarios,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    },
  });
});

export const getGlobalScenarioById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const scenario = await prisma.globalScenario.findUnique({
    where: { id },
  });

  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }

  res.status(200).json({
    status: 'success',
    data: {
      scenario,
    },
  });
});

export const updateGlobalScenario = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { scenarioCode, scenarioDescription, salesType } = req.body;

  const existingScenario = await prisma.globalScenario.findUnique({
    where: { id },
  });

  if (!existingScenario) {
    throw new AppError('Scenario not found', 404);
  }

  // Check if new scenario code is already taken by another scenario
  if (scenarioCode && scenarioCode !== existingScenario.scenarioCode) {
    const duplicateScenario = await prisma.globalScenario.findUnique({
      where: { scenarioCode },
    });

    if (duplicateScenario) {
      throw new AppError('Scenario code already in use', 400);
    }
  }

  const data = {};
  if (scenarioCode) data.scenarioCode = scenarioCode;
  if (scenarioDescription) data.scenarioDescription = scenarioDescription;
  // Don't trim salesType - preserve exact case sensitivity
  if (salesType !== undefined) data.salesType = salesType;

  const scenario = await prisma.globalScenario.update({
    where: { id },
    data,
  });

  res.status(200).json({
    status: 'success',
    data: {
      scenario,
    },
  });
});

export const deleteGlobalScenario = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  const scenario = await prisma.globalScenario.findUnique({
    where: { id },
    include: {
      userScenarios: true,
    },
  });

  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }

  // Check if scenario is assigned to any users
  if (scenario.userScenarios.length > 0) {
    throw new AppError(
      `Cannot delete scenario. It is assigned to ${scenario.userScenarios.length} user(s). Please unassign it first.`,
      400
    );
  }

  await prisma.globalScenario.delete({
    where: { id },
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});

// Admin APIs - Assign/Unassign Scenarios to Users

export const assignScenarioToUser = catchAsync(async (req, res, next) => {
  const { userId, scenarioId } = req.body;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Check if scenario exists
  const scenario = await prisma.globalScenario.findUnique({
    where: { id: scenarioId },
  });

  if (!scenario) {
    throw new AppError('Scenario not found', 404);
  }

  // Check if already assigned
  const existingAssignment = await prisma.userScenario.findUnique({
    where: {
      userId_scenarioId: {
        userId,
        scenarioId,
      },
    },
  });

  if (existingAssignment) {
    throw new AppError('Scenario already assigned to this user', 400);
  }

  const assignment = await prisma.userScenario.create({
    data: {
      userId,
      scenarioId,
    },
    include: {
      scenario: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  res.status(201).json({
    status: 'success',
    data: {
      assignment,
    },
  });
});

export const unassignScenarioFromUser = catchAsync(async (req, res, next) => {
  const { userId, scenarioId } = req.body;

  const assignment = await prisma.userScenario.findUnique({
    where: {
      userId_scenarioId: {
        userId,
        scenarioId,
      },
    },
  });

  if (!assignment) {
    throw new AppError('Scenario assignment not found', 404);
  }

  await prisma.userScenario.delete({
    where: {
      userId_scenarioId: {
        userId,
        scenarioId,
      },
    },
  });

  res.status(200).json({
    status: 'success',
    message: 'Scenario unassigned successfully',
  });
});

export const getUserAssignedScenarios = catchAsync(async (req, res, next) => {
  const { userId } = req.params;

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const assignments = await prisma.userScenario.findMany({
    where: { userId },
    include: {
      scenario: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      scenarios: assignments.map((a) => ({
        assignmentId: a.id,
        scenarioId: a.scenario.id,
        scenarioCode: a.scenario.scenarioCode,
        scenarioDescription: a.scenario.scenarioDescription,
        assignedAt: a.createdAt,
      })),
    },
  });
});

// User API - Get My Scenarios

export const getMyScenarios = catchAsync(async (req, res, next) => {
  const userId = req.user.userId;

  const assignments = await prisma.userScenario.findMany({
    where: { userId },
    include: {
      scenario: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      scenarios: assignments.map((a) => ({
        assignmentId: a.id,
        scenarioId: a.scenario.id,
        scenarioCode: a.scenario.scenarioCode,
        scenarioDescription: a.scenario.scenarioDescription,
        assignedAt: a.createdAt,
      })),
    },
  });
});
