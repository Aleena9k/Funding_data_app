import path from 'path';
import fs from 'fs';
import xlsx from 'xlsx';
import db from '../config/dbconfig.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Upload file function
export const uploadFile = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname);

  if (fileExtension !== '.xlsx' && fileExtension !== '.xls') {
    fs.unlinkSync(filePath); // Delete the invalid file
    return res.status(400).json({ message: 'Only Excel files are allowed' });
  }

  try {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const range = xlsx.utils.decode_range(worksheet['!ref']);

    for (let row = range.s.r; row <= range.e.r; row++) {
      let data = [];
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = xlsx.utils.encode_cell({ r: row, c: col });
        const cell = worksheet[cellAddress];
        data.push(cell ? cell.v : null);
      }

      const sql = `
        INSERT INTO Funding_data 
        (organization_name, monthly_visits, founded_date, operating_status, company_type, ipo_status, 
        number_of_employees, contact_job_departments, actively_hiring, last_funding_date, estimated_revenue_range, 
        last_funding_type, industries, headquarters_location, description, cb_rank_company, headquarters_regions, 
        website, linkedin, contact_email, phone_number, last_funding_amount, last_funding_amount_currency, 
        last_funding_amount_usd, funding_status, number_of_funding_rounds, last_equity_funding_amount, 
        last_equity_funding_amount_currency, last_equity_funding_amount_usd, last_equity_funding_type, 
        total_equity_funding_amount, total_equity_funding_amount_currency, total_equity_funding_amount_usd, 
        total_funding_amount, total_funding_amount_currency, total_funding_amount_usd, lead_investor, 
        valuation_at_ipo, contact_name, contact_title, work_email, linkedin_url, source_url, comment)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      await db.query(sql, data); // Ensure db.query is a promise
    }

    res.status(200).json({ message: 'File uploaded successfully and data inserted into the database' });
  } catch (error) {
    console.error('Error processing file:', error);
    return res.status(500).json({ message: 'Error processing the file' });
  }
};

// Search data function
export const searchFile = async (req, res) => {
  try {
    const { organization_name, 
            website, 
            number_of_employees, 
            estimated_revenue_range, 
            industries, 
            headquarters_location, 
            linkedin_url,
            contact_name, 
            contact_title } = req.body; // Accept multiple search parameters

    if (!organization_name 
        && !website
        && !number_of_employees
        && !estimated_revenue_range
        && !industries
        && !headquarters_location
        && !linkedin_url
        && !contact_name
        && !contact_title) {
      return res.status(400).json({
        message: 'At least one search parameter is required',
      });
    }

    let query = `
      SELECT DISTINCT 
        organization_name, 
        monthly_visits, 
        founded_date,
        operating_status,
        company_type,
        ipo_status, 
        number_of_employees,
        contact_job_departments, 
        actively_hiring, 
        last_funding_date, 
        estimated_revenue_range, 
        last_funding_type, 
        industries, 
        headquarters_location, 
        description, 
        cb_rank_company, 
        headquarters_regions, 
        website, 
        linkedin, 
        contact_email, 
        phone_number, 
        last_funding_amount, 
        last_funding_amount_currency, 
        last_funding_amount_usd, 
        funding_status, 
        number_of_funding_rounds, 
        last_equity_funding_amount, 
        last_equity_funding_amount_currency, 
        last_equity_funding_amount_usd, 
        last_equity_funding_type, 
        total_equity_funding_amount, 
        total_equity_funding_amount_currency, 
        total_equity_funding_amount_usd, 
        total_funding_amount, 
        total_funding_amount_currency, 
        total_funding_amount_usd, 
        lead_investor, 
        valuation_at_ipo, 
        contact_name, 
        contact_title, 
        work_email, 
        linkedin_url,
        source_url,
        comment
      FROM Funding_data
    `;

    const queryParams = [];
    const conditions = [];

    if (organization_name) {
      const organizationNamesArray = Array.isArray(organization_name)
        ? organization_name
        : organization_name.split(/[\n,]+/).map(name => name.trim()).filter(name => name);

      if (organizationNamesArray.length > 0) {
        const placeholders = organizationNamesArray.map(() => '?').join(', ');
        conditions.push(`organization_name IN (${placeholders})`);
        queryParams.push(...organizationNamesArray);
      }
    }
      
    if (number_of_employees) {
      const employeeRangesArray = Array.isArray(number_of_employees)
        ? number_of_employees
        : number_of_employees.split(/[\n,]+/).map((range) => range.trim()).filter((range) => range);
    
      if (employeeRangesArray.length > 0) {
        employeeRangesArray.forEach((range) => {
          if (range.includes('+')) {
            // Example: 10001+
            const minValue = parseInt(range.replace('+', '').trim(), 10);
            conditions.push(`number_of_employees >= ?`);
            queryParams.push(minValue);
          } else if (range.includes('-')) {
            // Example: 1001-5000
            const [min, max] = range.split('-').map((value) => parseInt(value.trim(), 10));
            conditions.push(`number_of_employees BETWEEN ? AND ?`);
            queryParams.push(min, max);
          }
        });
      }
    }
  

    if (website) {
      const websiteArray = Array.isArray(website)
        ? website
        : website.split(/\s+/).map(site => site.trim()).filter(site => site);

      if (websiteArray.length > 0) {
        const placeholders = websiteArray.map(() => '?').join(', ');
        conditions.push(`website IN (${placeholders})`);
        queryParams.push(...websiteArray);
      }
    }
  
    if (contact_name) {
      const contact_nameArray = Array.isArray(contact_name)
        ? contact_name
        : contact_name.split(/[\n,]+/).map(name => name.trim()).filter(name => name);

      if (contact_nameArray.length > 0) {
        const placeholders = contact_nameArray.map(() => '?').join(', ');
        conditions.push(`contact_name IN (${placeholders})`);
        queryParams.push(...contact_nameArray);
      }
    }
    
    if (contact_title) {
      const contactTitleArray = Array.isArray(contact_title)
        ? contact_title
        : contact_title.split(/[\n,]+/).map(title => title.trim()).filter(title => title);
    
      if (contactTitleArray.length > 0) {
        const placeholders = contactTitleArray.map(() => '?').join(', ');
        conditions.push(`contact_title IN (${placeholders})`);
        queryParams.push(...contactTitleArray);
      }
    }
    if (linkedin_url) {
      const linkedinArray = Array.isArray(linkedin_url)
        ? linkedin_url
        : linkedin_url.split(/\s+/).map(url => url.trim()).filter(url => url);
    
      if (linkedinArray.length > 0) {
        const placeholders = linkedinArray.map(() => '?').join(', ');
        conditions.push(`linkedin_url IN (${placeholders})`);
        queryParams.push(...linkedinArray);
      }
    }
    
    
    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' OR ');
    }

    const [results] = await db.query(query, queryParams);
    if (results.length === 0) {
      return res.status(404).json({ message: 'No data found for the specified search criteria' });
    }
    
    return res.status(200).json({ data: results });
  } catch (err) {
    console.error('Error searching company data:', err);
    res.status(500).json({ error: 'Failed to search company data' });
  }
};

// Export filtered data to Excel function
export const exportFile = async (req, res) => {
  try {
    // Get filtering parameters from the request (query params)
    const { organization_name, website } = req.query;

    let query = `
      SELECT DISTINCT 
        organization_name, 
        monthly_visits, 
        founded_date,
        operating_status,
        company_type,
        ipo_status, 
        number_of_employees,
        contact_job_departments, 
        actively_hiring, 
        last_funding_date, 
        estimated_revenue_range, 
        last_funding_type, 
        industries, 
        headquarters_location, 
        description, 
        cb_rank_company, 
        headquarters_regions, 
        website, 
        linkedin, 
        contact_email, 
        phone_number, 
        last_funding_amount, 
        last_funding_amount_currency, 
        last_funding_amount_usd, 
        funding_status, 
        number_of_funding_rounds, 
        last_equity_funding_amount, 
        last_equity_funding_amount_currency, 
        last_equity_funding_amount_usd, 
        last_equity_funding_type, 
        total_equity_funding_amount, 
        total_equity_funding_amount_currency, 
        total_equity_funding_amount_usd, 
        total_funding_amount, 
        total_funding_amount_currency, 
        total_funding_amount_usd, 
        lead_investor, 
        valuation_at_ipo, 
        contact_name, 
        contact_title, 
        work_email, 
        linkedin_url,
        source_url,
        comment
      FROM Funding_data
    `;

    const queryParams = [];
    const conditions = [];

    // Apply filters to the query if provided
    if (organization_name) {
      const organizationNamesArray = organization_name.split(/[\n,]+/).map(name => name.trim()).filter(name => name);
      if (organizationNamesArray.length > 0) {
        const placeholders = organizationNamesArray.map(() => '?').join(', ');
        conditions.push(`organization_name IN (${placeholders})`);
        queryParams.push(...organizationNamesArray);
      }
    }

    if (website) {
      const websiteArray = website.split(/\s+/).map(site => site.trim()).filter(site => site);
      if (websiteArray.length > 0) {
        const placeholders = websiteArray.map(() => '?').join(', ');
        conditions.push(`website IN (${placeholders})`);
        queryParams.push(...websiteArray);
      }
    }

    if (conditions.length > 0) {
      query += ` WHERE ` + conditions.join(' OR ');
    }

    // Execute query with filters
    const [data] = await db.query(query, queryParams);

    if (data.length === 0) {
      return res.status(404).json({ message: 'No data available for export' });
    }

    // Create Excel file
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(data);
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Exported Data');

    const tempDir = path.join(__dirname, 'temp');
    const filePath = path.join(tempDir, 'exported_data.xlsx');

    // Check if the temp folder exists, and create it if not
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Write the Excel file
    xlsx.writeFile(workbook, filePath);

    res.download(filePath, 'exported_data.xlsx', (err) => {
      if (err) {
        console.error('Error exporting file:', err);
        return res.status(500).json({ message: 'Error exporting file' });
      }

      // Delete the file after download
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
};
