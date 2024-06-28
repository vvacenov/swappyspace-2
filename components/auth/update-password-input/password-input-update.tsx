import { EyeOffIcon, EyeIcon, Check, X, Dot } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Box } from "@/components/ui/box/box";
import {
  FormField,
  FormItem,
  FormControl,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { createElement, useState } from "react";
import { PasswordStrengthRgx } from "@/lib/password-strength/password-strength-regex";

type PasswordFieldProps = {
  name?: string;
  placeholder?: string;
  description?: string | JSX.Element;
};

export function PasswordField({
  name = "password",
  placeholder = "Enter your new password here",
  description,
}: PasswordFieldProps) {
  const { control } = useFormContext();

  const [passwordVisibility, setPasswordVisibility] = useState(false);
  const [meterVisible, setMeterVisible] = useState(false);
  const [firstVisible, setFirstVisible] = useState(true);
  const [lettersOK, setLettersOK] = useState(false);
  const [numbersOK, setNumbersOK] = useState(false);
  const [specialOK, setSpecialOK] = useState(false);
  const [lengthOK, setLenghtOK] = useState(false);

  const checkPassword = (value: string) => {
    setLettersOK(PasswordStrengthRgx.regexLetters.test(value));
    setNumbersOK(PasswordStrengthRgx.regexNumbers.test(value));
    setSpecialOK(PasswordStrengthRgx.regexSpecialChars.test(value));
    setLenghtOK(PasswordStrengthRgx.regexLength.test(value));
    setFirstVisible(false);
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormControl>
            <Box className="relative">
              <Input
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  checkPassword(e.target.value);
                }}
                onFocus={() => setMeterVisible(true)}
                onBlur={() => setFirstVisible(false)}
                type={passwordVisibility ? "text" : "password"}
                autoComplete="on"
                placeholder={placeholder}
              />
              <Box
                className="absolute inset-y-0 right-0 flex cursor-pointer items-center p-3 text-muted-foreground"
                onClick={() => setPasswordVisibility(!passwordVisibility)}
              >
                {createElement(passwordVisibility ? EyeOffIcon : EyeIcon, {
                  className: "h-6 w-6",
                })}
              </Box>
            </Box>
          </FormControl>
          {meterVisible && firstVisible && (
            <div className="flex flex-col text-xs pt-2">
              <div>
                <div className="flex gap-1 items-center ">
                  <span>{createElement(Dot, { className: "h-5" })}</span>
                  <span>One letter</span>
                </div>
              </div>
              <div>
                <div className="flex gap-1 items-center">
                  <span>{createElement(Dot, { className: "h-5" })}</span>
                  <span>One number</span>
                </div>
              </div>
              <div>
                <div className="flex gap-1 items-center">
                  <span>{createElement(Dot, { className: "h-5" })}</span>
                  <span>One special character</span>
                </div>
              </div>
              <div>
                <div className="flex gap-1 items-center">
                  <span>{createElement(Dot, { className: "h-5" })}</span>
                  <span>9 or more characters</span>
                </div>
              </div>
            </div>
          )}
          {meterVisible && !firstVisible && (
            <div className="flex flex-col text-xs pt-2">
              <div>
                {lettersOK ? (
                  <div className="flex gap-1 text-green-600 items-center">
                    <span>{createElement(Check, { className: "h-5" })}</span>
                    <span>One letter</span>
                  </div>
                ) : (
                  <div className="flex gap-1  items-center">
                    <span>
                      {createElement(X, { className: "h-5 text-red-600" })}
                    </span>
                    <span>One letter</span>
                  </div>
                )}
              </div>
              {numbersOK ? (
                <div className="flex gap-1 text-green-600 items-center">
                  <span>{createElement(Check, { className: "h-5" })}</span>
                  <span>One number</span>
                </div>
              ) : (
                <div className="flex gap-1  items-center">
                  <span>
                    {createElement(X, { className: "h-5 text-red-600" })}
                  </span>
                  <span>One number</span>
                </div>
              )}
              {specialOK ? (
                <div className="flex gap-1 text-green-600 items-center">
                  <span>{createElement(Check, { className: "h-5" })}</span>
                  <span>One special character</span>
                </div>
              ) : (
                <div className="flex gap-1  items-center">
                  <span>
                    {createElement(X, { className: "h-5 text-red-600" })}
                  </span>
                  <span>One special character</span>
                </div>
              )}
              {lengthOK ? (
                <div className="flex gap-1 text-green-600 items-center">
                  <span>{createElement(Check, { className: "h-5" })}</span>
                  <span>9 or more characters</span>
                </div>
              ) : (
                <div className="flex gap-1  items-center">
                  <span>
                    {createElement(X, { className: "h-5 text-red-600" })}
                  </span>
                  <span>9 or more characters </span>
                </div>
              )}
            </div>
          )}

          {description && <FormDescription>{description}</FormDescription>}
        </FormItem>
      )}
    />
  );
}
