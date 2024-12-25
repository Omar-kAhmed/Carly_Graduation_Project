import React, { useState, useEffect } from "react";
import axios from "axios";
import styles from "./ConsultationBooking.module.css";

const ConsultationBooking = () => {
  const [consultationDetails, setConsultationDetails] = useState({
    name: "",
    email: "",
    query: "",
    file: null,
  });

  const [appointmentDetails, setAppointmentDetails] = useState({
    date: "",
    timeSlot: "",
  });

  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAvailableSlots = async () => {
      try {
        const response = await axios.get("http://localhost:8080/api/appointments/slots");
        setTimeSlots(response.data.availableSlots || []);
      } catch (error) {
        console.error("Error fetching available slots:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailableSlots();
  }, []);

  const handleConsultationSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", consultationDetails.name);
    formData.append("email", consultationDetails.email);
    formData.append("query", consultationDetails.query);
    if (consultationDetails.file) {
      formData.append("file", consultationDetails.file);
    }

    try {
      await axios.post("http://localhost:8080/api/consultations", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Consultation submitted successfully!");
    } catch (error) {
      console.error("Error submitting consultation:", error);
      alert("Failed to submit consultation. Please try again.");
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    const selectedDate = new Date(appointmentDetails.date);
    if (selectedDate < new Date()) {
      alert("Please select a future date for the appointment.");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/appointments", appointmentDetails);
      alert("Appointment booked successfully!");
    } catch (error) {
      console.error("Error booking appointment:", error);
      alert("Failed to book appointment. Please try again.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>Online Consultation & Booking</h1>
      <div className={styles.formSection}>
        <form className={styles.form} onSubmit={handleConsultationSubmit}>
          <h2>Consultation</h2>
          <input
            type="text"
            placeholder="Your Name"
            value={consultationDetails.name}
            onChange={(e) =>
              setConsultationDetails({ ...consultationDetails, name: e.target.value })
            }
            required
          />
          <input
            type="email"
            placeholder="Your Email"
            value={consultationDetails.email}
            onChange={(e) =>
              setConsultationDetails({ ...consultationDetails, email: e.target.value })
            }
            required
          />
          <textarea
            placeholder="Describe your issue..."
            value={consultationDetails.query}
            onChange={(e) =>
              setConsultationDetails({ ...consultationDetails, query: e.target.value })
            }
            required
          />
          <input type="file" onChange={(e) => {
            const file = e.target.files[0];
            if (file && file.size <= 5 * 1024 * 1024) {
              setConsultationDetails({ ...consultationDetails, file });
            } else {
              alert("File size exceeds 5MB.");
            }
          }} />
          <button type="submit">Submit Query</button>
        </form>
      </div>
      <div className={styles.formSection}>
        <form className={styles.form} onSubmit={handleAppointmentSubmit}>
          <h2>Book Appointment</h2>
          <input
            type="date"
            min={new Date().toISOString().split("T")[0]}
            value={appointmentDetails.date}
            onChange={(e) =>
              setAppointmentDetails({ ...appointmentDetails, date: e.target.value })
            }
            required
          />
          <select
            value={appointmentDetails.timeSlot}
            onChange={(e) =>
              setAppointmentDetails({ ...appointmentDetails, timeSlot: e.target.value })
            }
            required
          >
            <option value="">Select Time Slot</option>

<option value="9:00 AM - 10:00 AM">9:00 AM 
- 10:00 AM</option>

            {isLoading ? (
              <option>Loading time slots...</option>
            ) : (
              timeSlots.map((slot, index) => (
                <option key={index} value={slot}>
                  {slot}
                </option>
              ))
            )}
          </select>
          <button type="submit">Book Appointment</button>
        </form>
      </div>
    </div>
  );
};

export default ConsultationBooking;
