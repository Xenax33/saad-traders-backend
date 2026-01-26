import { PrismaClient } from '@prisma/client';
import { AppError } from '../utils/errors.js';

const prisma = new PrismaClient();

// FBR API Configuration
const FBR_SANDBOX_BASE_URL = 'https://gw.fbr.gov.pk/di_data/v1/di';
const FBR_PRODUCTION_BASE_URL = 'https://gw.fbr.gov.pk/di_data/v1/di';

/**
 * Post Invoice to FBR (Sandbox or Production)
 * @route POST /api/v1/invoices
 */
export const postInvoice = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      invoiceType,
      invoiceDate,
      buyerId,
      scenarioId,
      invoiceRefNo,
      items,
      isTestEnvironment = true, // Default to test environment
    } = req.body;

    // Get user (seller) information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        postInvoiceTokenTest: true,
        postInvoiceToken: true,
        ntncnic: true,
        businessName: true,
        province: true,
        address: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Select the appropriate token based on environment
    const fbrToken = isTestEnvironment
      ? user.postInvoiceTokenTest
      : user.postInvoiceToken;

    if (!fbrToken) {
      throw new AppError(
        `FBR ${isTestEnvironment ? 'test' : 'production'} token not configured for this user`,
        400
      );
    }

    // Get buyer information
    const buyer = await prisma.buyer.findFirst({
      where: {
        id: buyerId,
        userId, // Ensure buyer belongs to current user
      },
    });

    if (!buyer) {
      throw new AppError('Buyer not found', 404);
    }

    // Get scenario information - Check if scenario is assigned to user
    const userScenario = await prisma.userScenario.findFirst({
      where: {
        scenarioId,
        userId, // Ensure scenario is assigned to current user
      },
      include: {
        scenario: true,
      },
    });

    if (!userScenario) {
      throw new AppError('Scenario not found or not assigned to you', 404);
    }

    const scenario = userScenario.scenario;

    // Get HS codes for all items
    const hsCodeIds = items.map((item) => item.hsCodeId);
    const hsCodes = await prisma.hsCode.findMany({
      where: {
        id: { in: hsCodeIds },
        userId, // Ensure HS codes belong to current user
      },
    });

    if (hsCodes.length !== hsCodeIds.length) {
      throw new AppError('One or more HS codes not found', 404);
    }

    // Create a map of hsCodeId to hsCode for easy lookup
    const hsCodeMap = new Map(hsCodes.map((hc) => [hc.id, hc.hsCode]));

    // Prepare FBR API payload
    const fbrPayload = {
      invoiceType,
      invoiceDate,
      sellerNTNCNIC: user.ntncnic,
      sellerBusinessName: user.businessName,
      sellerProvince: user.province,
      sellerAddress: user.address,
      buyerNTNCNIC: buyer.ntncnic,
      buyerBusinessName: buyer.businessName,
      buyerProvince: buyer.province,
      buyerAddress: buyer.address,
      buyerRegistrationType: buyer.registrationType,
      invoiceRefNo: invoiceRefNo || '',
      scenarioId: scenario.scenarioCode,
      items: items.map((item) => ({
        hsCode: hsCodeMap.get(item.hsCodeId),
        productDescription: item.productDescription,
        rate: item.rate,
        uoM: item.uoM,
        quantity: item.quantity,
        totalValues: item.totalValues,
        valueSalesExcludingST: item.valueSalesExcludingST,
        fixedNotifiedValueOrRetailPrice: item.fixedNotifiedValueOrRetailPrice,
        salesTaxApplicable: item.salesTaxApplicable,
        salesTaxWithheldAtSource: item.salesTaxWithheldAtSource,
        extraTax: item.extraTax || '',
        furtherTax: item.furtherTax,
        sroScheduleNo: item.sroScheduleNo || '',
        fedPayable: item.fedPayable,
        discount: item.discount,
        saleType: scenario.salesType,
        sroItemSerialNo: item.sroItemSerialNo || '',
      })),
    };

    // Call FBR API
    const fbrEndpoint = isTestEnvironment
      ? `${FBR_SANDBOX_BASE_URL}/postinvoicedata_sb`
      : `${FBR_PRODUCTION_BASE_URL}/postinvoicedata`;

    const fbrResponse = await fetch(fbrEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fbrToken}`,
      },
      body: JSON.stringify(fbrPayload),
    });

    const fbrResponseData = await fbrResponse.json();

    // Check if FBR API call was successful
    if (!fbrResponse.ok) {
      throw new AppError(
        `FBR API Error: ${fbrResponseData.message || 'Failed to post invoice'}`,
        fbrResponse.status
      );
    }

    // Extract invoice number from FBR response (adjust based on actual FBR response structure)
    const fbrInvoiceNumber = fbrResponseData.invoiceNumber || fbrResponseData.InvoiceNumber || null;

    // Save invoice to database
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        buyerId,
        scenarioId,
        invoiceType,
        invoiceDate: new Date(invoiceDate),
        invoiceRefNo,
        fbrInvoiceNumber,
        fbrResponse: fbrResponseData,
        isTestEnvironment,
        items: {
          create: items.map((item) => ({
            hsCodeId: item.hsCodeId,
            productDescription: item.productDescription,
            rate: item.rate,
            uoM: item.uoM,
            quantity: item.quantity,
            totalValues: item.totalValues,
            valueSalesExcludingST: item.valueSalesExcludingST,
            fixedNotifiedValueOrRetailPrice: item.fixedNotifiedValueOrRetailPrice,
            salesTaxApplicable: item.salesTaxApplicable,
            salesTaxWithheldAtSource: item.salesTaxWithheldAtSource,
            extraTax: item.extraTax,
            furtherTax: item.furtherTax,
            sroScheduleNo: item.sroScheduleNo,
            fedPayable: item.fedPayable,
            discount: item.discount,
            sroItemSerialNo: item.sroItemSerialNo,
          })),
        },
      },
      include: {
        items: {
          include: {
            hsCode: true,
          },
        },
        buyer: true,
        scenario: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        invoice,
        fbrResponse: fbrResponseData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate Invoice with FBR (Sandbox or Production)
 * @route POST /api/v1/invoices/validate
 */
export const validateInvoice = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { invoiceNumber, isTestEnvironment = true } = req.body;

    // Get user to retrieve FBR tokens
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        validateInvoiceTokenTest: true,
        validateInvoiceToken: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Select the appropriate token based on environment
    const fbrToken = isTestEnvironment
      ? user.validateInvoiceTokenTest
      : user.validateInvoiceToken;

    if (!fbrToken) {
      throw new AppError(
        `FBR ${isTestEnvironment ? 'test' : 'production'} validation token not configured for this user`,
        400
      );
    }

    // Call FBR Validation API
    const fbrEndpoint = isTestEnvironment
      ? `${FBR_SANDBOX_BASE_URL}/validateinvoicedata_sb`
      : `${FBR_PRODUCTION_BASE_URL}/validateinvoicedata`;

    const fbrResponse = await fetch(fbrEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${fbrToken}`,
      },
      body: JSON.stringify({ invoiceNumber }),
    });

    const fbrResponseData = await fbrResponse.json();

    // Check if FBR API call was successful
    if (!fbrResponse.ok) {
      throw new AppError(
        `FBR API Error: ${fbrResponseData.message || 'Failed to validate invoice'}`,
        fbrResponse.status
      );
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoiceNumber,
        validationResult: fbrResponseData,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all invoices for the authenticated user
 * @route GET /api/v1/invoices
 */
export const getUserInvoices = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      page = 1,
      limit = 10,
      invoiceType,
      isTestEnvironment,
      startDate,
      endDate,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter conditions
    const where = {
      userId,
      ...(invoiceType && { invoiceType }),
      ...(isTestEnvironment !== undefined && {
        isTestEnvironment: isTestEnvironment === 'true',
      }),
      ...(startDate && endDate && {
        invoiceDate: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      }),
    };

    // Get invoices with pagination
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          items: {
            include: {
              hsCode: true,
            },
          },
          buyer: true,
          scenario: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              businessName: true,
              ntncnic: true,
              province: true,
              address: true,
            },
          },
        },
        skip,
        take: parseInt(limit),
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        invoices,
        pagination: {
          total,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific invoice by ID
 * @route GET /api/v1/invoices/:id
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId,
      },
      include: {
        items: {
          include: {
            hsCode: true,
          },
        },
        buyer: true,
        scenario: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            businessName: true,
            ntncnic: true,
            province: true,
            address: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    res.status(200).json({
      status: 'success',
      data: {
        invoice,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an invoice
 * @route DELETE /api/v1/invoices/:id
 */
export const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Check if invoice exists and belongs to user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!invoice) {
      throw new AppError('Invoice not found', 404);
    }

    // Delete invoice (cascade will delete items)
    await prisma.invoice.delete({
      where: { id },
    });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Post Invoice to FBR Production
 * @route POST /api/v1/invoices/production
 */
export const postProductionInvoice = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const {
      invoiceType,
      invoiceDate,
      buyerId,
      invoiceRefNo,
      items,
    } = req.body;

    // Get user (seller) information
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        postInvoiceToken: true,
        ntncnic: true,
        businessName: true,
        province: true,
        address: true,
      },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.postInvoiceToken) {
      throw new AppError(
        'Production FBR token not configured for this user. Please contact admin.',
        400
      );
    }

    // Get buyer information
    const buyer = await prisma.buyer.findFirst({
      where: {
        id: buyerId,
        userId, // Ensure buyer belongs to current user
      },
    });

    if (!buyer) {
      throw new AppError('Buyer not found', 404);
    }

    // Validate HS codes exist and belong to user
    const hsCodeIds = items.map((item) => item.hsCodeId);
    const hsCodes = await prisma.hsCode.findMany({
      where: {
        id: { in: hsCodeIds },
        userId,
      },
    });

    if (hsCodes.length !== hsCodeIds.length) {
      throw new AppError('One or more HS codes not found', 404);
    }

    // Create a map of HS codes for quick lookup
    const hsCodeMap = {};
    hsCodes.forEach((hs) => {
      hsCodeMap[hs.id] = hs.hsCode;
    });

    // Prepare FBR invoice items
    const fbrItems = items.map((item) => ({
      hsCode: hsCodeMap[item.hsCodeId],
      productDescription: item.productDescription,
      rate: item.rate,
      uoM: item.uoM,
      quantity: parseFloat(item.quantity),
      totalValues: parseFloat(item.totalValues),
      valueSalesExcludingST: parseFloat(item.valueSalesExcludingST),
      fixedNotifiedValueOrRetailPrice: parseFloat(item.fixedNotifiedValueOrRetailPrice),
      salesTaxApplicable: parseFloat(item.salesTaxApplicable),
      salesTaxWithheldAtSource: parseFloat(item.salesTaxWithheldAtSource),
      extraTax: parseFloat(item.extraTax || 0),
      furtherTax: parseFloat(item.furtherTax),
      sroScheduleNo: item.sroScheduleNo || '',
      fedPayable: parseFloat(item.fedPayable),
      discount: parseFloat(item.discount),
      saleType: item.saleType,
      sroItemSerialNo: item.sroItemSerialNo || '',
    }));

    // Prepare FBR API request payload
    const fbrPayload = {
      invoiceType,
      invoiceDate,
      sellerNTNCNIC: user.ntncnic,
      sellerBusinessName: user.businessName,
      sellerProvince: user.province,
      sellerAddress: user.address,
      buyerNTNCNIC: buyer.ntncnic,
      buyerBusinessName: buyer.businessName,
      buyerProvince: buyer.province,
      buyerAddress: buyer.address,
      buyerRegistrationType: buyer.registrationType,
      invoiceRefNo: invoiceRefNo || '',
      items: fbrItems,
    };

    // Call FBR Production API
    let fbrResponse;
    try {
      const response = await fetch('https://gw.fbr.gov.pk/di_data/v1/di/postinvoicedata', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.postInvoiceToken}`,
        },
        body: JSON.stringify(fbrPayload),
      });

      fbrResponse = await response.json();

      if (!response.ok) {
        throw new AppError(
          `FBR API Error: ${fbrResponse.message || 'Failed to post invoice'}`,
          response.status
        );
      }
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(`Failed to connect to FBR API: ${error.message}`, 500);
    }

    // Save invoice to database
    const invoice = await prisma.invoice.create({
      data: {
        userId,
        buyerId,
        invoiceType,
        invoiceDate: new Date(invoiceDate),
        sellerNTNCNIC: user.ntncnic,
        sellerBusinessName: user.businessName,
        sellerProvince: user.province,
        sellerAddress: user.address,
        buyerNTNCNIC: buyer.ntncnic,
        buyerBusinessName: buyer.businessName,
        buyerProvince: buyer.province,
        buyerAddress: buyer.address,
        buyerRegistrationType: buyer.registrationType,
        invoiceRefNo: invoiceRefNo || null,
        scenarioId: null,
        fbrInvoiceNumber: fbrResponse.invoiceNumber || null,
        fbrResponse: fbrResponse,
        isTestEnvironment: false,
        items: {
          create: items.map((item) => ({
            hsCodeId: item.hsCodeId,
            hsCode: hsCodeMap[item.hsCodeId],
            productDescription: item.productDescription,
            rate: item.rate,
            uoM: item.uoM,
            quantity: item.quantity.toString(),
            totalValues: item.totalValues.toString(),
            valueSalesExcludingST: item.valueSalesExcludingST.toString(),
            fixedNotifiedValueOrRetailPrice: item.fixedNotifiedValueOrRetailPrice.toString(),
            salesTaxApplicable: item.salesTaxApplicable.toString(),
            salesTaxWithheldAtSource: item.salesTaxWithheldAtSource.toString(),
            extraTax: (item.extraTax || 0).toString(),
            furtherTax: item.furtherTax.toString(),
            sroScheduleNo: item.sroScheduleNo || '',
            fedPayable: item.fedPayable.toString(),
            discount: item.discount.toString(),
            saleType: item.saleType,
            sroItemSerialNo: item.sroItemSerialNo || '',
          })),
        },
      },
      include: {
        items: {
          include: {
            hsCode: {
              select: {
                id: true,
                hsCode: true,
                description: true,
              },
            },
          },
        },
        buyer: true,
      },
    });

    res.status(201).json({
      status: 'success',
      data: {
        invoice,
        fbrResponse,
      },
    });
  } catch (error) {
    next(error);
  }
};
