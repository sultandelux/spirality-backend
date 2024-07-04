import { Request, Response } from 'express';
import TestService from './test-service';

class TestController {
  private testService: TestService;

  constructor(testService: TestService) {
    this.testService = testService;
  }

  createTest = async (req: Request, res: Response): Promise<void> => {
    try {
      const testData = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const testFile = files['material'] ? files['material'][0] : null;

      console.log('Received test data:', testData);
      console.log('Received test file:', testFile);

      if (!testFile) {
        res.status(400).json({ message: 'Test file is required' });
        return;
      }

      const newTest = await this.testService.createTest(
        testData,
        testFile.buffer,
        testFile.originalname
      );

      res.status(201).json(newTest);
    } catch (error) {
      console.error('Error creating test:', error);
      res.status(500).json({ message: 'Error creating test', error });
    }
  };

  getTest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      console.log(`Fetching test with id: ${id}`);
      const test = await this.testService.getTest(id);

      if (test) {
        res.status(200).json(test);
      } else {
        res.status(404).json({ message: 'Test not found' });
      }
    } catch (err) {
      console.error('Error getting test:', err);
      res.status(500).json({ message: 'Error getting test', error: err });
    }
  };

  getAllTests = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('Fetching all tests');
      const tests = await this.testService.getAllTests();
      res.status(200).json(tests);
    } catch (err) {
      console.error('Error getting tests:', err);
      res.status(500).json({ message: 'Error getting tests', error: err });
    }
  };

  updateTest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const testUpdate = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      const testFile = files['test'] ? files['test'][0] : null;

      console.log('Received test update data:', testUpdate);
      console.log('Received test file:', testFile);

      const updatedTest = await this.testService.updateTest(
        id,
        testUpdate,
        testFile ? testFile.buffer : undefined,
        testFile ? testFile.originalname : undefined
      );

      if (updatedTest) {
        res.status(200).json(updatedTest);
      } else {
        res.status(404).json({ message: 'Test not found' });
      }
    } catch (error) {
      console.error('Error updating test:', error);
      res.status(500).json({ message: 'Error updating test', error });
    }
  };

  deleteTest = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const test = await this.testService.deleteTest(id);

      if (test) {
        res.status(200).json(test);
      } else {
        res.status(404).json({ message: 'Test not found' });
      }
    } catch (err) {
      console.error('Error deleting test:', err);
      res.status(500).json({ message: 'Error deleting test', error: err });
    }
  };
}

export default TestController;
