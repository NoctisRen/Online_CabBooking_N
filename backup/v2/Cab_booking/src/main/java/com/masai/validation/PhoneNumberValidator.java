package com.masai.validation;  // 注意包名

import javax.validation.ConstraintValidator;
import javax.validation.ConstraintValidatorContext;
import java.util.regex.Pattern;

public class PhoneNumberValidator implements ConstraintValidator<PhoneNumber, String> {

    // 中国手机号正则：1开头，第二位3-9，后面9位数字
    private static final Pattern PHONE_PATTERN = Pattern.compile("^1[3-9]\\d{9}$");

    @Override
    public void initialize(PhoneNumber constraintAnnotation) {
        // 初始化方法，如果需要可以在这里获取注解参数
    }

    @Override
    public boolean isValid(String phoneNumber, ConstraintValidatorContext context) {
        // 如果值为null，我们认为它是有效的（由@NotNull等其他注解处理）
        if (phoneNumber == null) {
            return true;
        }

        // 去除空格
        String cleanedNumber = phoneNumber.trim();

        // 空字符串无效
        if (cleanedNumber.isEmpty()) {
            return false;
        }

        // 使用正则表达式验证格式
        return PHONE_PATTERN.matcher(cleanedNumber).matches();
    }
}