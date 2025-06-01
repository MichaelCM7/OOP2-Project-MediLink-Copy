package com.MediLink.OOP2_Project_MediLink.model;

import jakarta.persistence.*;

@Entity
public class Rating {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int ratingID;

    @Column(nullable = false)
    private int rating;

    private String comment;

    @Column(nullable = false)
    private int date;

    @Column(nullable = false)
    private int time;

    public Rating() {}

    public Rating(int ratingID, int rating, String comment, int date, int time) {
        this.ratingID = ratingID;
        this.rating = rating;
        this.comment = comment;
        this.date = date;
        this.time = time;
    }

    public int getRatingID() {
        return ratingID;
    }

    public int getRating() {
        return rating;
    }
    public void setRating(int rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public int getDate() {
        return date;
    }

    public void setDate(int date) {
        this.date = date;
    }

    public int getTime() {
        return time;
    }

    public void setTime(int time) {
        this.time = time;
    }
}
