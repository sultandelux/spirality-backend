import { Router } from 'express'
import authRouter from './auth/auth-router'
import plantRouter from './test/test-router'

const globalRouter = Router()

globalRouter.use('/auth', authRouter)
globalRouter.use('/tests', plantRouter)

export default globalRouter
