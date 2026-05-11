package com.ramesh.backend.entity;

public enum AdjustmentType {
    RECEIVED, //stock in from purchase order or direct receive
    SOLD,
    SPOILED, //expired
    DAMAGED,
    MANUAL_ADJUST
}
