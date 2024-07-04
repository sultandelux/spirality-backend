import { Router } from 'express'
import { authMiddleware } from '../../middlewares/auth-middleware'
import TestService from './test-service'
import TestController from './test-controller'
import multer from 'multer'

const testRouter = Router()
const storage = multer.memoryStorage()
const upload = multer({ storage })

const testService = new TestService()
const testController = new TestController(testService)

testRouter.post(
  '/create',
  upload.fields([{ name: 'material', maxCount: 4 }]),
  testController.createTest
)

testRouter.get('/get_all', testController.getAllTests)
testRouter.get('/tests/:id', testController.getTest)
testRouter.put('/tests/:id', testController.updateTest)
testRouter.delete('/tests/:id', testController.deleteTest)

export default testRouter
