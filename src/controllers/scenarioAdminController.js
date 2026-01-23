import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';

const prisma = new PrismaClient();

export const createGlobalScenario = async (req, res, next) => {
  try {
    const { scenarioCode, scenarioDescription } = req.body;

    const existing = await prisma.globalScenario.findUnique({
      where: { scenarioCode },
    });
    if (existing) {
      throw new AppError('Global scenario with this code already exists', 400);
    }

    const scenario = await prisma.globalScenario.create({
      data: { scenarioCode, scenarioDescription },
    });

    res.status(201).json({ status: 'success', data: { scenario } });
  } catch (err) {
    next(err);
  }
};

export const getGlobalScenarios = async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where = search
      ? {
          OR: [
            { scenarioCode: { contains: search, mode: 'insensitive' } },
            { scenarioDescription: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {};

    const [scenarios, total] = await Promise.all([
      prisma.globalScenario.findMany({ where, skip, take: Number(limit), orderBy: { scenarioCode: 'asc' } }),
      prisma.globalScenario.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: { scenarios, pagination: { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) } },
    });
  } catch (err) {
    next(err);
  }
};

export const updateGlobalScenario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { scenarioCode, scenarioDescription, salesType } = req.body;

    const data = {};
    if (scenarioCode !== undefined) data.scenarioCode = scenarioCode.trim();
    if (scenarioDescription !== undefined) data.scenarioDescription = scenarioDescription.trim();
    // Don't trim salesType - preserve exact case sensitivity
    if (salesType !== undefined) data.salesType = salesType;

    const scenario = await prisma.globalScenario.update({
      where: { id },
      data,
    });

    res.status(200).json({ status: 'success', data: { scenario } });
  } catch (err) {
    next(err);
  }
};

export const deleteGlobalScenario = async (req, res, next) => {
  try {
    const { id } = req.params;
    const globalScenario = await prisma.globalScenario.findUnique({ where: { id } });
    if (!globalScenario) {
      throw new AppError('Global scenario not found', 404);
    }

    const inUse = await prisma.scenario.count({ where: { scenarioCode: globalScenario.scenarioCode } });
    if (inUse > 0) {
      throw new AppError('Cannot delete global scenario assigned to users', 400);
    }

    await prisma.globalScenario.delete({ where: { id } });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

export const assignScenarioToUser = async (req, res, next) => {
  try {
    const { userId, scenarioId } = req.body; // scenarioId refers to GlobalScenario.id

    const globalScenario = await prisma.globalScenario.findUnique({ where: { id: scenarioId } });
    if (!globalScenario) {
      throw new AppError('Global scenario not found', 404);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const assigned = await prisma.scenario.upsert({
      where: { userId_scenarioCode: { userId, scenarioCode: globalScenario.scenarioCode } },
      update: { scenarioDescription: globalScenario.scenarioDescription },
      create: {
        userId,
        scenarioCode: globalScenario.scenarioCode,
        scenarioDescription: globalScenario.scenarioDescription,
      },
    });

    res.status(201).json({ status: 'success', data: { scenario: assigned } });
  } catch (err) {
    next(err);
  }
};

export const unassignScenarioFromUser = async (req, res, next) => {
  try {
    const { userId, scenarioId } = req.body; // scenarioId refers to GlobalScenario.id

    const globalScenario = await prisma.globalScenario.findUnique({ where: { id: scenarioId } });
    if (!globalScenario) {
      throw new AppError('Global scenario not found', 404);
    }

    const existing = await prisma.scenario.findUnique({
      where: { userId_scenarioCode: { userId, scenarioCode: globalScenario.scenarioCode } },
    });
    if (!existing) {
      throw new AppError('Scenario not assigned to this user', 404);
    }

    const inUse = await prisma.invoice.count({ where: { userId, scenarioId: existing.id } });
    if (inUse > 0) {
      throw new AppError('Cannot unassign scenario that is used in invoices', 400);
    }

    await prisma.scenario.delete({ where: { id: existing.id } });
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

export const getUserAssignedScenarios = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const scenarios = await prisma.scenario.findMany({ where: { userId }, orderBy: { scenarioCode: 'asc' } });
    res.status(200).json({ status: 'success', data: { scenarios } });
  } catch (err) {
    next(err);
  }
};

export const bulkAssignScenariosToUser = async (req, res, next) => {
  try {
    const { userId, scenarioIds = [], scenarioCodes = [] } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('User not found', 404);
    }

    let globals = [];
    if (Array.isArray(scenarioIds) && scenarioIds.length > 0) {
      globals = await prisma.globalScenario.findMany({ where: { id: { in: scenarioIds } } });
    } else if (Array.isArray(scenarioCodes) && scenarioCodes.length > 0) {
      globals = await prisma.globalScenario.findMany({ where: { scenarioCode: { in: scenarioCodes } } });
    } else {
      throw new AppError('Provide scenarioIds or scenarioCodes array', 400);
    }

    if (globals.length === 0) {
      throw new AppError('No matching global scenarios found', 404);
    }

    const results = [];
    for (const g of globals) {
      const assigned = await prisma.scenario.upsert({
        where: { userId_scenarioCode: { userId, scenarioCode: g.scenarioCode } },
        update: { scenarioDescription: g.scenarioDescription },
        create: { userId, scenarioCode: g.scenarioCode, scenarioDescription: g.scenarioDescription },
      });
      results.push(assigned);
    }

    res.status(201).json({ status: 'success', data: { scenarios: results } });
  } catch (err) {
    next(err);
  }
};
