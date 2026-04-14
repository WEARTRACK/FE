import { Href, Link } from "expo-router";
import { Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = {
  label: string;
  href?: Href;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
};

function getContainerClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  fullWidth: boolean,
  className?: string,
) {
  const baseClassName = "items-center justify-center rounded-lg";
  const widthClassName = fullWidth ? "w-full" : "";
  const sizeClassName =
    size === "lg" ? "h-[58px] px-5" : size === "md" ? "h-[50px] px-5" : "h-[50px] px-4";

  const variantClassName = disabled
    ? "bg-disabled"
    : variant === "secondary"
      ? "border-[0.5px] border-text-subdued bg-white"
      : "bg-bg-dark";

  return [baseClassName, widthClassName, sizeClassName, variantClassName, className]
    .filter(Boolean)
    .join(" ");
}

function getLabelClassName(
  variant: ButtonVariant,
  size: ButtonSize,
  disabled: boolean,
  textClassName?: string,
) {
  const colorClassName = disabled
    ? "text-bg-light"
    : variant === "secondary"
      ? "text-text"
      : "text-white";

  const sizeClassName =
    size === "lg"
      ? "font-pretendard-semibold text-button-lg"
      : "font-pretendard-semibold text-button-md";

  return [colorClassName, sizeClassName, textClassName].filter(Boolean).join(" ");
}

type ButtonInnerProps = {
  label: string;
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
  fullWidth: boolean;
  onPress?: () => void;
  className?: string;
  textClassName?: string;
};

function ButtonContent({
  label,
  variant,
  size,
  disabled = false,
  fullWidth,
  onPress,
  className,
  textClassName,
}: ButtonInnerProps) {
  return (
    <Pressable
      className={getContainerClassName(variant, size, disabled, fullWidth, className)}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        opacity: !disabled && pressed ? 0.7 : 1,
      })}
    >
      <Text className={getLabelClassName(variant, size, disabled, textClassName)}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label,
  href,
  variant = "primary",
  size = "lg",
  disabled = false,
  fullWidth = false,
  onPress,
  className,
  textClassName,
}: ButtonProps) {
  if (href) {
    return (
      <Link href={href} asChild>
        <ButtonContent
          label={label}
          variant={variant}
          size={size}
          disabled={disabled}
          fullWidth={fullWidth}
          onPress={onPress}
          className={className}
          textClassName={textClassName}
        />
      </Link>
    );
  }

  return (
    <ButtonContent
      label={label}
      variant={variant}
      size={size}
      disabled={disabled}
      fullWidth={fullWidth}
      onPress={onPress}
      className={className}
      textClassName={textClassName}
    />
  );
}
