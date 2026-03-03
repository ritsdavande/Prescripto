import React, { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { AppContext } from "../../context/AppContext";
import { toast } from "react-toastify";
import axios from "axios";

const DoctorProfile = () => {
  const { dToken, profileData, setProfileData, getProfileData, backendUrl } =
    useContext(DoctorContext);
  const { currency } = useContext(AppContext);

  const [isEdit, setIsEdit] = useState(false);

  useEffect(() => {
    if (dToken) {
      getProfileData();
    }
  }, [dToken]);

  const updateProfile = async () => {
    try {
      const updateData = {
        fees: profileData.fees,
        address: profileData.address,
        available: profileData.available,
        about: profileData.about,
      };

      const { data } = await axios.post(
        backendUrl + "/api/doctor/update-profile",
        updateData,
        { headers: { dtoken: dToken } }
      );

      if (data.success) {
        toast.success(data.message);
        setIsEdit(false);
        getProfileData();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    profileData && (
      <div className="m-5">
        <div className="flex flex-col gap-4 m-5">
          {/* Doctor Image */}
          <div>
            <img
              className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
              src={profileData.image}
              alt=""
            />
          </div>

          {/* Doctor Info Card */}
          <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
            {/* Name, Degree, Experience */}
            <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
              {profileData.name}
            </p>
            <div className="flex items-center gap-2 mt-1 text-gray-600">
              <p>{profileData.degree} - {profileData.speciality}</p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {profileData.experience}
              </button>
            </div>

            {/* About */}
            <div className="mt-3">
              <p className="text-sm font-medium text-neutral-800">About:</p>
              {isEdit ? (
                <textarea
                  className="w-full outline-primary mt-1 text-sm text-gray-600 border rounded p-2"
                  rows={5}
                  value={profileData.about}
                  onChange={(e) =>
                    setProfileData((prev) => ({ ...prev, about: e.target.value }))
                  }
                />
              ) : (
                <p className="text-sm text-gray-600 max-w-[700px] mt-1">
                  {profileData.about}
                </p>
              )}
            </div>

            {/* Appointment Fee */}
            <p className="text-gray-600 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-800">
                {currency}{" "}
                {isEdit ? (
                  <input
                    type="number"
                    className="border rounded p-1 w-24 text-sm outline-primary"
                    value={profileData.fees}
                    onChange={(e) =>
                      setProfileData((prev) => ({
                        ...prev,
                        fees: e.target.value,
                      }))
                    }
                  />
                ) : (
                  profileData.fees
                )}
              </span>
            </p>

            {/* Address */}
            <div className="flex gap-2 py-2">
              <p>Address:</p>
              <p className="text-sm">
                {isEdit ? (
                  <span className="flex flex-col gap-1">
                    <input
                      className="border rounded p-1 text-sm outline-primary"
                      type="text"
                      value={profileData.address?.line1 || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line1: e.target.value },
                        }))
                      }
                      placeholder="Address line 1"
                    />
                    <input
                      className="border rounded p-1 text-sm outline-primary"
                      type="text"
                      value={profileData.address?.line2 || ""}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: { ...prev.address, line2: e.target.value },
                        }))
                      }
                      placeholder="Address line 2"
                    />
                  </span>
                ) : (
                  <>
                    {profileData.address?.line1}
                    <br />
                    {profileData.address?.line2}
                  </>
                )}
              </p>
            </div>

            {/* Availability Toggle */}
            <div className="flex gap-1 pt-2">
              <input
                onChange={() => {
                  if (isEdit) {
                    setProfileData((prev) => ({
                      ...prev,
                      available: !prev.available,
                    }));
                  }
                }}
                checked={profileData.available}
                type="checkbox"
                id="available"
                readOnly={!isEdit}
              />
              <label htmlFor="available" className="cursor-pointer select-none">
                Available
              </label>
            </div>

            {/* Edit / Save Button */}
            {isEdit ? (
              <button
                onClick={updateProfile}
                className="px-4 py-1 border border-primary text-sm text-primary rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                Save
              </button>
            ) : (
              <button
                onClick={() => setIsEdit(true)}
                className="px-4 py-1 border border-primary text-sm text-primary rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
              >
                Edit
              </button>
            )}
          </div>
        </div>
      </div>
    )
  );
};

export default DoctorProfile;
