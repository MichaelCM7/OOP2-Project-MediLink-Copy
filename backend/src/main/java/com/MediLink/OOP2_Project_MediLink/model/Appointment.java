package com.MediLink.OOP2_Project_MediLink.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "appointment")
public class Appointment {
    @Id
    private String appointmentId;
    private String date;
    private String time;
    private String doctorName;
    private String hospitalName;

    public Appointment() {}

    public Appointment(String date, String time, String doctorName, String hospitalName) {
        this.date = date;
        this.time = time;
        this.doctorName = doctorName;
        this.hospitalName = hospitalName;
    }

    // Getters and setters
    public String getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(String appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getDate() {
        return date;
    }

    public void setDate(String date) {
        this.date = date;
    }

    public String getTime() {
        return time;
    }

    public void setTime(String time) {
        this.time = time;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getHospitalName() {
        return hospitalName;
    }

    public void setHospitalName(String hospitalName) {
        this.hospitalName = hospitalName;
    }
}