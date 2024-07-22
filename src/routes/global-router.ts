import { Router } from 'express'
import authRouter from './auth/auth-router'
import testRouter from './test/test-router'

const globalRouter = Router()

globalRouter.use('/auth', authRouter)
globalRouter.use('/course',testRouter)

export default globalRouter
