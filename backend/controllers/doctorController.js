import doctorModel from "../models/doctorModel.js";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await doctorModel.findOne({ email });
    if (!doctor) return res.json({ success: false, message: "Invalid credentials" });
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) return res.json({ success: false, message: "Invalid credentials" });
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET);
    res.json({ success: true, token });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for admin to change doctor availability
const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, { available: !docData.available });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all doctors
const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get all appointments for a doctor
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    const userIds = [...new Set(appointments.map((a) => a.userId))];
    const users = await userModel.find({ _id: { $in: userIds } });
    const userMap = {};
    users.forEach((u) => { userMap[String(u._id)] = u; });

    const enrichedAppointments = appointments.map((appointment) => {
      const app = appointment.toObject();
      if (userMap[app.userId]) app.userData = userMap[app.userId];
      return app;
    });

    res.json({ success: true, appointments: enrichedAppointments });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor to cancel appointment
const appointmentCancel = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData.docId !== docId) return res.json({ success: false, message: "Unauthorized action" });

    await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

    const { slotDate, slotTime } = appointmentData;
    const docData = await doctorModel.findById(docId);
    let slots_booked = docData.slots_booked;
    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter((e) => e !== slotTime);
    }
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API for doctor to mark appointment as completed
const appointmentComplete = async (req, res) => {
  try {
    const { docId, appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);
    if (appointmentData.docId !== docId) return res.json({ success: false, message: "Unauthorized action" });
    await appointmentModel.findByIdAndUpdate(appointmentId, { isCompleted: true });
    res.json({ success: true, message: "Appointment Completed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor dashboard data
const getDoctorDashboard = async (req, res) => {
  try {
    const { docId } = req.body;
    const appointments = await appointmentModel.find({ docId });

    // Total earnings from completed appointments only
    let earnings = 0;
    appointments.forEach((item) => {
      if (item.isCompleted) earnings += item.amount;
    });

    // Unique patients
    const patients = [...new Set(appointments.map((item) => item.userId))];

    // Latest 5 appointments with user data
    const latestAppointments = [...appointments].reverse().slice(0, 5);
    const userIds = latestAppointments.map((a) => a.userId);
    const users = await userModel.find({ _id: { $in: userIds } });
    const userMap = {};
    users.forEach((u) => { userMap[String(u._id)] = u; });

    const latestWithData = latestAppointments.map((app) => {
      const a = app.toObject ? app.toObject() : { ...app };
      if (userMap[a.userId]) a.userData = userMap[a.userId];
      return a;
    });

    const dashData = {
      earnings,
      appointments: appointments.length,
      patients: patients.length,
      latestAppointments: latestWithData,
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to get doctor profile
const getDoctorProfile = async (req, res) => {
  try {
    const { docId } = req.body;
    const profileData = await doctorModel.findById(docId).select("-password");
    res.json({ success: true, profileData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

// API to update doctor profile
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId, fees, address, available, about } = req.body;
    await doctorModel.findByIdAndUpdate(docId, { fees, address, available, about });
    res.json({ success: true, message: "Profile Updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  loginDoctor,
  changeAvailability,
  doctorList,
  appointmentsDoctor,
  appointmentCancel,
  appointmentComplete,
  getDoctorDashboard,
  getDoctorProfile,
  updateDoctorProfile,
};