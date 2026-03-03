import React, { useContext, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";

const DoctorAppointments = () => {
  const { dToken, appointments, getAppointments, cancelAppointment, completeAppointment } =
    useContext(DoctorContext);
  const { calculateAge, slotDateFormat, currency } = useContext(AppContext);

  useEffect(() => {
    if (dToken) {
      getAppointments();
    }
  }, [dToken]);

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] min-h-[60vh] overflow-y-scroll">
        {/* Table Header */}
        <div className="hidden sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date &amp; Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {/* Appointment rows */}
        {appointments.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-gray-400">
            No appointments found
          </div>
        ) : (
          appointments.map((item, index) => (
            <div
              key={index}
              className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 transition-colors"
            >
              {/* # */}
              <p className="max-sm:hidden">{index + 1}</p>

              {/* Patient name + image */}
              <div className="flex items-center gap-2">
                <img
                  className="w-8 rounded-full object-cover"
                  src={item.userData?.image || ""}
                  alt=""
                />
                <p>{item.userData?.name}</p>
              </div>

              {/* Payment status badge */}
              <div>
                <p
                  className={`text-xs font-medium inline-block px-2 py-0.5 rounded-full ${
                    item.payment
                      ? "bg-green-100 text-green-600"
                      : "bg-blue-50 text-blue-500"
                  }`}
                >
                  {item.payment ? "Online" : "Cash"}
                </p>
              </div>

              {/* Age */}
              <p className="max-sm:hidden">
                {calculateAge(item.userData?.dob)}
              </p>

              {/* Date & Time */}
              <p>
                {slotDateFormat(item.slotDate)}, {item.slotTime}
              </p>

              {/* Fees */}
              <p>
                {currency}
                {item.amount}
              </p>

              {/* Action */}
              <div className="flex items-center gap-1">
                {item.cancelled ? (
                  <p className="text-red-400 text-xs font-medium">Cancelled</p>
                ) : item.isCompleted ? (
                  <p className="text-green-500 text-xs font-medium">Completed</p>
                ) : (
                  <>
                    <img
                      onClick={() => cancelAppointment(item._id)}
                      className="w-10 cursor-pointer hover:opacity-80 transition-opacity"
                      src={assets.cancel_icon}
                      alt="Cancel"
                      title="Cancel Appointment"
                    />
                    <img
                      onClick={() => completeAppointment(item._id)}
                      className="w-10 cursor-pointer hover:opacity-80 transition-opacity"
                      src={assets.tick_icon}
                      alt="Complete"
                      title="Mark as Completed"
                    />
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DoctorAppointments;
