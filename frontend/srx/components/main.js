import React, { useState } from 'react';
import axios from 'axios';

function UploadData() {
  const [file, setFile] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState({
    organization_name: '',
    website: '',
    number_of_employees: '',
    contact_name: '',
  });

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleFileUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:2000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setLoading(false);
      alert('File uploaded successfully!');
      setTableData(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
      setLoading(false);
      alert('Failed to upload file.');
    }
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchQuery((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post('http://localhost:2000/api/search', searchQuery);
      setTableData(response.data.data);
    } catch (error) {
      console.error('Error fetching filtered data:', error);
      alert('Failed to fetch filtered data. Please try again.');
    }
  };

  const handleExport = async () => {
    try {
      // Send filters with the request
      const response = await axios.get('http://localhost:2000/api/export', {
        params: { 
          organization_name: searchQuery.organization_name, 
          website: searchQuery.website 
        },
        responseType: 'blob', // Ensure the response is handled as a blob
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'exported_data.xlsx');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    }
  };

  return (
    <>
      <style>{`
     html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  font-family: 'Arial', sans-serif;
  background: linear-gradient(135deg, #1c92d2, #f2fcfe);
  color: #333;
}

.container {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 10%;
  background-color: rgb(145,8,8);
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.sidebar button {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border: none;
  border-radius: 5px;
  background-color: rgb(237,232,208);
  color: black;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s;
}

.sidebar button:hover {
  background-color:rgb(207, 50, 50);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: rgb(237,232,208);
  overflow-y: auto;
}

.search-section {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 20px;
}

.search-section textarea {
  flex: 1;
  min-width: 200px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  resize: none;
  font-size: 14px;
}

.search-section textarea:focus {
  border-color:rgb(145,8,8);
  outline: none;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  background-color: #f8f9fa;
  border-radius: 5px;
  overflow: hidden;
}

.data-table th.leadinvestor,
.data-table td.leadinvestor {
  width: 50px; 
}

.data-table th, .data-table td {
  padding: 10px 15px;
  text-align: left;
  border: 1px solid #ddd;
  vertical-align: top;
}

.data-table th {
  background-color: rgb(145,8 ,8);
  color: white;
  font-weight: bold;
  position: sticky;
  top: 0;
  z-index: 1;
}

.data-table td {
  //white space : nowrap; 
  overflow: hidden; 
  text-overflow: ellipsis; /* Add ellipsis for overflowing text */
}

.data-table tr:nth-child(even) {
  background-color: #f2f2f2;
}

.data-table tr:hover {
  background-color: #ddd;
}
      `}</style>

      <div className="container">
        <div className="sidebar">
          <input type="file" id="fileInput" style={{ display: 'none' }} onChange={handleFileChange} />
          <button onClick={() => document.getElementById('fileInput').click()}>Choose File</button>
          <button onClick={handleFileUpload} disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Data'}
          </button>
          <button onClick={handleSearch}>Filter</button>
          <button onClick={handleExport}>Export Data</button>
        </div>

            <div className="main-content">
              <div className="search-section">
                <textarea
                  name="organization_name"
                  value={searchQuery.organization_name}
                  onChange={handleSearchChange}
                  placeholder="Search by Organization Name"
                />

                <textarea
                  name="number_of_employees"
                  value={searchQuery.number_of_employees}
                  onChange={handleSearchChange}
                  placeholder="Search by Number of Employees"
                />
                
                <textarea
                  name="contact_name" 
                  value={searchQuery.contact_name || ''} 
                  onChange={handleSearchChange}
                  placeholder="Search by Name"
                />

                <textarea
                  name="contact_title"
                  value={searchQuery.contact_title}
                  onChange={handleSearchChange}
                  placeholder="Search by Title"
                />
                <textarea
                  name="linkedin_url"
                  value={searchQuery.linkedin_url}
                  onChange={handleSearchChange}
                  placeholder="Search by Linkedin"
                />
                 <textarea
                  name="website"
                  value={searchQuery.website}
                  onChange={handleSearchChange}
                  placeholder="Search by Website"
                />
        
              </div>
            

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                    <th>Organization Name</th>
                    <th>Monthly Visits</th>
                    <th>Founded Date</th>
                    <th>Operating Status</th>
                    <th>Company Type</th>
                    <th>IPO Status</th>
                    <th>Number of Employees</th>
                    <th style = {{ minWidth : "250px"}}>Contact Job Departments</th>
                    <th>Actively Hiring</th>
                    <th>Last Funding Date</th>
                    <th>Estimated Revenue Range</th>
                    <th>Last Funding Type</th>
                    <th style = {{ minWidth : "250px"}}>Industries</th>
                    <th>Headquarters Location</th>
                    <th style = {{ minWidth : "250px"}}>Description</th>
                    <th>CB Rank (Company)</th>
                    <th style = {{ minWidth : "250px"}}>Headquarters Regions</th>
                    <th>Website</th>
                    <th>Contact Email</th>
                    <th>Phone Number</th>
                    <th>Last Funding Amount</th>
                    <th>Last Funding Amount Currency</th>
                    <th>Last Funding Amount (in USD)</th>
                    <th>Funding Status</th>
                    <th>Number of Funding Rounds</th>
                    <th>Last Equity Funding Amount</th>
                    <th>Last Equity Funding Amount Currency</th>
                    <th>Last Equity Funding Amount (in USD)</th>
                    <th>Last Equity Funding Type</th>
                    <th>Total Equity Funding Amount</th>
                    <th>Total Equity Funding Amount Currency</th>
                    <th>Total Equity Funding Amount (in USD)</th>
                    <th>Total Funding Amount</th>
                    <th>Total Funding Amount Currency</th>
                    <th>Total Funding Amount (in USD)</th>
                    <th style = {{ minWidth : "200px"}}>Lead Investor</th>
                    <th>Valuation at IPO</th>
                    <th>Name</th>
                    <th>Title</th>
                    <th>Work Email</th>
                    <th>Linked URL</th>
                    <th style = {{minWidth : "200px"}}>Source URL</th>
                    <th>Comment</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr key={index}>
                        <td>{row.organization_name}</td>
                        <td>{row.monthly_visits}</td>
                        <td>{row.founded_date}</td>
                        <td>{row.operating_status}</td>
                        <td>{row.company_type}</td>
                        <td>{row.ipo_status}</td>
                        <td>{row.number_of_employees}</td>
                        <td>{row.contact_job_departments}</td>
                        <td>{row.actively_hiring}</td>
                        <td>{row.last_funding_date}</td>
                        <td>{row.estimated_revenue_range}</td>
                        <td>{row.last_funding_type}</td>
                        <td>{row.industries}</td>
                        <td>{row.headquarters_location}</td>
                        <td>{row.description}</td>
                        <td>{row.cb_rank_company}</td>
                        <td>{row.headquarters_regions}</td>
                        <td>{row.website}</td>
                        <td>{row.contact_email}</td>
                        <td>{row.phone_number}</td>
                        <td>{row.last_funding_amount}</td>
                        <td>{row.last_funding_amount_currency}</td>
                        <td>{row.last_funding_amount_usd}</td>
                        <td>{row.funding_status}</td>
                        <td>{row.number_of_funding_rounds}</td>
                        <td>{row.last_equity_funding_amount}</td>
                        <td>{row.last_equity_funding_amount_currency}</td>
                        <td>{row.last_equity_funding_amount_usd}</td>
                        <td>{row.last_equity_funding_type}</td>
                        <td>{row.total_equity_funding_amount}</td>
                        <td>{row.total_equity_funding_amount_currency}</td>
                        <td>{row.total_equity_funding_amount_usd}</td>
                        <td>{row.total_funding_amount}</td>
                        <td>{row.total_funding_amount_currency}</td>
                        <td>{row.total_funding_amount_usd}</td>
                        <td>{row.lead_investor}</td>
                        <td>{row.valuation_at_ipo}</td>
                        <td>{row.contact_name}</td>
                        <td>{row.contact_title}</td>
                        <td>{row.work_email}</td>
                        <td>{row.linkedin_url}</td>
                        <td>{row.source_url}</td>
                        <td>{row.comment}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9">No data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}

export default UploadData;
