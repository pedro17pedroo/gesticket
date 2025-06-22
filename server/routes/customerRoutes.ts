import { Router } from "express";
import { CustomerController } from "../controllers/CustomerController";
import { isAuthenticated } from "../replitAuth";

const router = Router();
const customerController = new CustomerController();

router.get('/', isAuthenticated, (req, res) => 
  customerController.getCustomers(req, res)
);

router.get('/:id', isAuthenticated, (req, res) => 
  customerController.getCustomerById(req, res)
);

router.post('/', isAuthenticated, (req, res) => 
  customerController.createCustomer(req, res)
);

router.get('/:id/hour-bank', isAuthenticated, (req, res) => 
  customerController.getHourBankStatus(req, res)
);

export { router as default };