import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';  
import dataRoutes from './Routes/fileRoutes.js';
 
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);  

const app = express();
     
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  
app.use(cors());  

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api', dataRoutes); 
const port = 2000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
