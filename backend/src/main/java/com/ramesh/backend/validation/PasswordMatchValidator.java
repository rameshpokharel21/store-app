package com.ramesh.backend.validation;

import com.ramesh.backend.dto.request.RegisterRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.lang.annotation.Annotation;

public class PasswordMatchValidator implements ConstraintValidator<PasswordMatch, Object> {
    @Override
    public void initialize(PasswordMatch constraintAnnotation) {

    }

    @Override
    public boolean isValid(Object obj, ConstraintValidatorContext constraintValidatorContext) {
        if(obj instanceof RegisterRequest){
            RegisterRequest request = (RegisterRequest) obj;
            return request.password() != null &&
                    request.password().equals(request.confirmPassword());
        }
        return true;
    }
}
