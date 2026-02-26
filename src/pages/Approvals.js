import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getHitlActionsByStatus,
  approveHitlAction,
  rejectHitlAction,
} from "../services/api";

function Approvals() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  const [reasonMap, setReasonMap] = useState({}); // { actionId: "reason text" }

  const loadPending = () => {
    setLoading(true);
    getHitlActionsByStatus("PENDING")
      .then((res) => {
        setActions(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
        toast.error("Failed to load pending actions");
      });
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      const reason = reasonMap[id] || "";
      await approveHitlAction(id, reason);
      toast.success("Approved & executed");
      loadPending();
    } catch (e) {
      toast.error("Approve failed");
    }
  };

  const handleReject = async (id) => {
    try {
      const reason = reasonMap[id] || "";
      await rejectHitlAction(id, reason);
      toast.success("Rejected");
      loadPending();
    } catch (e) {
      toast.error("Reject failed");
    }
  };

  const setReason = (id, value) => {
    setReasonMap((prev) => ({ ...prev, [id]: value }));
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Approvals (HITL)</h2>
        <button className="btn btn-outline-primary" onClick={loadPending}>
          Refresh
        </button>
      </div>

      {actions.length === 0 ? (
        <div className="alert alert-success">
          No pending approval requests 🎉
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Request ID</th>
                <th>Action Type</th>
                <th>Requested By</th>
                <th>Requested At</th>
                <th>Payload (raw)</th>
                <th style={{ width: 260 }}>Reason (optional)</th>
                <th style={{ width: 220 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {actions.map((a) => (
                <tr key={a.id}>
                  <td style={{ fontSize: 12 }} className="text-muted">
                    {a.id}
                  </td>
                  <td>
                    <span className="badge bg-warning text-dark">
                      {a.actionType}
                    </span>
                  </td>
                  <td>{a.requestedBy}</td>
                  <td style={{ fontSize: 13 }}>{a.requestedAt}</td>
                  <td style={{ fontSize: 12 }}>
                    <code>{a.payload}</code>
                  </td>
                  <td>
                    <input
                      className="form-control form-control-sm"
                      placeholder="Reason (optional)"
                      value={reasonMap[a.id] || ""}
                      onChange={(e) => setReason(a.id, e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleApprove(a.id)}
                      >
                        Approve
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleReject(a.id)}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Approvals;