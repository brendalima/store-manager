const Sale = require('../models/saleModel');
const saleService = require('../services/saleService');
const httpCodes = require('../helper/httpCodes');

const {
  SUCCESS,
  INVALID_DATA,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR } = httpCodes;

const getAllSales = async (req, res) => {
  try {
    const results = await Sale.getAllSales();
  
    return res.status(SUCCESS).json({sales: results});
  } catch (err) {
    return res.status(INTERNAL_SERVER_ERROR).json({ message: err.message });
  }
};

const getSaleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await Sale.getSaleById(id);
  
    if (!result) throw Error('Sale not found');
  
    return res.status(SUCCESS).json(result);
  } catch (err) {
    return res.status(NOT_FOUND).json({
      err: {code: 'not_found', message: err.message }
    });
  }
};

const newSale = async (req, res) => {
  const sales = req.body;

  const verifications = saleService.verifyEntries(sales);
  const saleIsForbidden = await saleService.verifyProduct(sales);
  try {
    if (verifications) throw Error(verifications);
    if (saleIsForbidden) throw Error(saleIsForbidden);
    const newSale = await Sale.newSale(sales);
    return res.status(SUCCESS).json(newSale);
  } catch (err) {
    if (err.message === 'Wrong product ID or invalid quantity') {
      return res.status(INVALID_DATA).json({
        err: {code: 'invalid_data', message: err.message }
      });
    }
    return res.status(NOT_FOUND).json({
      err: {code: 'stock_problem', message: err.message }
    });
  }
};

const editSaleById = async (req, res) => {
  const sales = req.body;
  const {id} = req.params;
  const verifications = saleService.verifyEntries(sales);
  try {
    if (verifications) {
      throw Error(verifications);
    }
    const editedSale = await Sale.editSaleById(sales, id);
    return res.status(SUCCESS).json(editedSale);
  } catch (err) {
    return res.status(INVALID_DATA).json({
      err: {code: 'invalid_data', message: err.message }
    });
  }
};

const deleteSaleById = async (req, res) => {
  const { id } = req.params;
  const result = await Sale.getSaleById(id);
  try {
    if (!result) throw Error('Wrong sale ID format');
    await Sale.deleteSaleById(id);
    return res.status(SUCCESS).json(result);
  } catch (err) {
    return res.status(INVALID_DATA).json({
      err: {code: 'invalid_data', message: err.message }
    });
  }
};

module.exports = {
  getAllSales,
  newSale,
  getSaleById,
  editSaleById,
  deleteSaleById,
};