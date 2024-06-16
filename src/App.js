import React, { useState, useEffect } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";

axios.defaults.baseURL = "http://127.0.0.1:5000";

function App() {
  const [logs, setLogs] = useState([]);
  const [severity, setSeverity] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage, setLogsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    fetchLogs();
  }, [severity, startDate, endDate, sortColumn, sortOrder]);

  const fetchLogs = async () => {
    try {
      const response = await axios.get("/logs", {
        params: { severity, start_date: startDate, end_date: endDate },
      });
      let sortedLogs = response.data.map(log => ({
        ...log,
        id: parseInt(log.id) // Преобразуем id в числовой формат
      }));

      if (sortColumn) {
        sortedLogs = [...sortedLogs].sort((a, b) => {
          if (sortOrder === "asc") {
            return a[sortColumn] > b[sortColumn] ? 1 : -1;
          } else {
            return a[sortColumn] < b[sortColumn] ? 1 : -1;
          }
        });
      }

      setLogs(sortedLogs);
      setTotalLogs(sortedLogs.length);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error fetching logs:", error);
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const handleLogsPerPageChange = (e) => {
    setLogsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const handleColumnSort = (column) => {
    if (column === sortColumn) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = logs.slice(indexOfFirstLog, indexOfLastLog);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalLogs / logsPerPage); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="container mt-5">
      <h1 className="mb-4">Log Viewer</h1>
      <form className="form-inline mb-4">
        <div className="form-group mr-3">
          <label htmlFor="severity" className="mr-2">
            Severity:
          </label>
          <select
            className="form-control"
            id="severity"
            value={severity}
            onChange={(e) => setSeverity(e.target.value)}
          >
            <option value="">All</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
          </select>
        </div>
        <div className="form-group mr-3">
          <label htmlFor="startDate" className="mr-2">
            Start Date:
          </label>
          <input
            type="date"
            className="form-control"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group mr-3">
          <label htmlFor="endDate" className="mr-2">
            End Date:
          </label>
          <input
            type="date"
            className="form-control"
            id="endDate"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </form>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th onClick={() => handleColumnSort("id")}>ID</th>
            <th onClick={() => handleColumnSort("severity")}>Severity</th>
            <th onClick={() => handleColumnSort("date")}>Date</th>
            <th onClick={() => handleColumnSort("description")}>Description</th>
          </tr>
        </thead>
        <tbody>
          {currentLogs.map((log) => (
            <tr key={log.id}>
              <td>{log.id}</td>
              <td>{log.severity}</td>
              <td>{log.date}</td>
              <td>{log.description}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="d-flex justify-content-between">
        <div>
          <label htmlFor="logsPerPage" className="mr-2">
            Logs per page:
          </label>
          <select
            id="logsPerPage"
            className="form-control d-inline-block w-auto"
            value={logsPerPage}
            onChange={handleLogsPerPageChange}
          >
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
        </div>
        <nav>
          <ul className="pagination">
            {pageNumbers.map((number) => (
              <li key={number} className={`page-item ${currentPage === number ? "active" : ""}`}>
                <a onClick={() => handlePageChange(number)} className="page-link">
                  {number}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mt-3">
        <p>Total Logs: {totalLogs}</p>
      </div>
    </div>
  );
}

export default App;
