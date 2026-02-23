import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import Doctor from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import appointmentModel from "../models/appointmentModel.js";

//api for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // Log received data for debugging
    console.log("=== DEBUGGING REQUEST ===");
    console.log("Full body:", req.body);
    console.log("Body keys:", Object.keys(req.body));
    console.log("name:", name, "| type:", typeof name);
    console.log("email:", email, "| type:", typeof email);
    console.log("password:", password, "| type:", typeof password);
    console.log("speciality:", speciality, "| type:", typeof speciality);
    console.log("degree:", degree, "| type:", typeof degree);
    console.log("experience:", experience, "| type:", typeof experience);
    console.log("about:", about, "| type:", typeof about);
    console.log("fees:", fees, "| type:", typeof fees);
    console.log("address:", address, "| type:", typeof address);
    console.log("File:", req.file);
    console.log("=========================");

    //checking for all data to add doctor
    //checking for all data to add doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res.json({ success: false, message: "Missing Details" });
    }

    // Check if image file was uploaded
    if (!imageFile) {
      return res.json({
        success: false,
        message: "Image file is required",
      });
    }

    //vlaidating email
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Invalid email" });
    }

    //validating password
    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }
    //hashing doctor password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    //upload image to cloudinary
    const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });
    const imageUrl = imageUpload.secure_url;

    const doctorData = {
      name,
      email,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: typeof address === "string" ? JSON.parse(address) : address,
      image: imageUrl,
      date: Date.now(),
    };
    const newDoctor = new Doctor(doctorData);
    await newDoctor.save();
    res.json({ success: true, message: "Doctor added successfully" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for admin login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//ApI to get all doctors for admin panel
const allDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find({}).select("-password");
    res.json({ success: true, doctors });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
//API for admin dashboard
const adminDashboard = async (req, res) => {
  try {
    const doctors = await Doctor.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    const dashData = {
      doctors: doctors.length,
      appointments: appointments.length,
      patients: users.length,
      latestAppointments: appointments.reverse().slice(0, 5)
    };

    res.json({ success: true, dashData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await Doctor.findById(docId);
    await Doctor.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.json({ success: true, message: "Availability Changed" });
  } catch (error) { 
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for get all appointment list

//API for get all appointment list

const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});
    // Fetch fresh user data to display updated information (like DOB)
    const users = await userModel.find({}); 
    
    // Convert users array to a map for O(1) lookup
    const userMap = {};
    users.forEach(user => {
        // Ensure keys are strings for comparison
        userMap[String(user._id)] = user;
    });

    // Merge fresh user data into appointments
    const appointmentsWithData = appointments.map(appointment => {
        const app = appointment.toObject(); // Use toObject() for modification if it's a Mongoose document
        if (userMap[app.userId]) {
            app.userData = userMap[app.userId];
        }
        return app;
    });

    res.json({ success: true, appointments: appointmentsWithData });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//API for appointment cancellation
const appointmentCancel = async (req, res) => {
  try {
    const { appointmentId } = req.body;
    const appointmentData = await appointmentModel.findById(appointmentId);

    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    // releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const docData = await Doctor.findById(docId);
    let slots_booked = docData.slots_booked;

    if (slots_booked[slotDate]) {
      slots_booked[slotDate] = slots_booked[slotDate].filter(
        (e) => e !== slotTime,
      );
    }

    await Doctor.findByIdAndUpdate(docId, { slots_booked });
    res.json({ success: true, message: "Appointment Cancelled" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addDoctor,
  loginAdmin,
  allDoctors,
  changeAvailability,
  adminDashboard,
  appointmentsAdmin,
  appointmentCancel,
};
