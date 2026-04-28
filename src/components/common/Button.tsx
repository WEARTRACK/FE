import { Href, Link } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

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
  leadingIcon?: ReactNode;
  leadingIconClassName?: string;
};

function hasUtilityClass(className: string | undefined, prefixes: string[]) {
  if (!className) {
    return false;
  }

  return className
    .split(/\s+/)
    .filter(Boolean)
    .some((token) => prefixes.some((prefix) => token.startsWith(prefix)));
}

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
    size === "lg" ? "h-[55px] px-5" : size === "md" ? "h-[50px] px-5" : "h-[50px] px-4";
  const hasBackgroundOverride = hasUtilityClass(className, ["bg-"]);
  const hasBorderOverride = hasUtilityClass(className, ["border-"]);

  const variantClassName = disabled
    ? hasBackgroundOverride
      ? ""
      : "bg-disabled"
    : variant === "secondary"
      ? [
          hasBorderOverride ? "" : "border-[0.5px] border-text-subdued",
          hasBackgroundOverride ? "" : "bg-white",
        ]
          .filter(Boolean)
          .join(" ")
      : hasBackgroundOverride
        ? ""
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
  const hasTextOverride = hasUtilityClass(textClassName, ["text-"]);
  const colorClassName = hasTextOverride
    ? ""
    : disabled
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
  leadingIcon?: ReactNode;
  leadingIconClassName?: string;
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
  leadingIcon,
  leadingIconClassName,
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
      <View className="relative w-full items-center justify-center">
        {leadingIcon ? (
          <View
            className={[
              "absolute inset-y-0 left-[12px] items-center justify-center",
              leadingIconClassName,
            ]
              .filter(Boolean)
              .join(" ")}
          >
            {leadingIcon}
          </View>
        ) : null}
        <Text className={getLabelClassName(variant, size, disabled, textClassName)}>{label}</Text>
      </View>
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
  leadingIcon,
  leadingIconClassName,
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
          leadingIcon={leadingIcon}
          leadingIconClassName={leadingIconClassName}
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
      leadingIcon={leadingIcon}
      leadingIconClassName={leadingIconClassName}
    />
  );
}
