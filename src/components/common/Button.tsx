import { Href, Link } from "expo-router";
import { Pressable, Text } from "react-native";

type ButtonVariant = "primary" | "secondary";
type ButtonSize = "md" | "lg";

type ButtonProps = {
  label: string;
  href?: Href;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  onPress?: () => void;
};

function getContainerClassName(variant: ButtonVariant, size: ButtonSize, disabled: boolean) {
  const baseClassName = "items-center justify-center rounded-2xl";
  const variantClassName =
    variant === "secondary" ? "border border-slate-200 bg-white" : "bg-brand";
  const sizeClassName = size === "lg" ? "px-5 py-4" : "px-4 py-3";
  const disabledClassName = disabled ? "opacity-50" : "";

  return `${baseClassName} ${variantClassName} ${sizeClassName} ${disabledClassName}`.trim();
}

function getLabelClassName(variant: ButtonVariant, size: ButtonSize) {
  const colorClassName = variant === "secondary" ? "text-ink" : "text-brand-foreground";
  const sizeClassName = size === "lg" ? "text-base" : "text-sm";

  return `${colorClassName} ${sizeClassName} font-semibold`;
}

type ButtonContentProps = {
  label: string;
  variant: ButtonVariant;
  size: ButtonSize;
  disabled?: boolean;
  onPress?: () => void;
};

function ButtonContent({
  label,
  variant,
  size,
  disabled = false,
  onPress,
}: ButtonContentProps) {
  return (
    <Pressable
      className={getContainerClassName(variant, size, disabled)}
      disabled={disabled}
      onPress={onPress}
    >
      <Text className={getLabelClassName(variant, size)}>{label}</Text>
    </Pressable>
  );
}

export function Button({
  label,
  href,
  variant = "primary",
  size = "lg",
  disabled = false,
  onPress,
}: ButtonProps) {
  if (href) {
    return (
      <Link href={href} asChild>
        <ButtonContent label={label} variant={variant} size={size} disabled={disabled} />
      </Link>
    );
  }

  return (
    <ButtonContent
      label={label}
      variant={variant}
      size={size}
      disabled={disabled}
      onPress={onPress}
    />
  );
}
