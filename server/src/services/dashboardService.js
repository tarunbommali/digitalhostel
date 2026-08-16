const Student = require('../models/Student');
const Room = require('../models/Room');
const BedAllocation = require('../models/BedAllocation');
const OutingLog = require('../models/OutingLog');
const AttendanceRecord = require('../models/AttendanceRecord');
const MonthlyBill = require('../models/MonthlyBill');
const LeaveRequest = require('../models/LeaveRequest');
const FlagReport = require('../models/FlagReport');

class DashboardService {
  static async getAggregatedMetrics(organizationId) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalStudents,
      activeResidents,
      totalRooms,
      allocatedBeds,
      activeOutings,
      todayAttendance,
      pendingLeaves,
      openFlags,
      duesAgg,
    ] = await Promise.all([
      Student.countDocuments({ organizationId, status: 'active' }),
      Student.countDocuments({ organizationId, status: 'active', isHostelResident: true }),
      Room.find({ organizationId, isActive: true }).select('capacity currentOccupants').lean(),
      BedAllocation.countDocuments({ organizationId, isCurrent: true }),
      OutingLog.countDocuments({ organizationId, type: 'out', status: 'approved_exit' }),
      AttendanceRecord.countDocuments({ organizationId, createdAt: { $gte: today } }),
      LeaveRequest.countDocuments({ organizationId, status: 'pending' }),
      FlagReport.countDocuments({ organizationId, status: 'open' }),
      MonthlyBill.aggregate([
        { $match: { organizationId, status: { $in: ['unpaid', 'partially_paid'] } } },
        { $group: { _id: null, totalRemaining: { $sum: '$remainingAmount' } } },
      ]),
    ]);

    const totalCapacity = totalRooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const occupancyRate = totalCapacity > 0 ? Math.round((allocatedBeds / totalCapacity) * 100) : 0;
    const totalDuesOutstanding = duesAgg[0]?.totalRemaining || 0;

    return {
      totalStudents,
      activeResidents,
      totalRooms: totalRooms.length,
      totalCapacity,
      allocatedBeds,
      occupancyRate,
      activeOutings,
      todayAttendance,
      pendingLeaves,
      openFlags,
      totalDuesOutstanding,
    };
  }
}

module.exports = DashboardService;
