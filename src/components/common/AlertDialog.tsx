import { Modal, Pressable, Text, View } from "react-native";

import { colors } from "@/constants/colors";

const ALERT_WIDTH = 345;
const ALERT_HEIGHT = 219;

export type AlertDialogAction = {
  label: string;
  onPress: () => void | Promise<void>;
};

export type AlertDialogProps = {
  visible: boolean;
  title: string;
  message?: string;
  confirmAction: AlertDialogAction;
  cancelAction?: AlertDialogAction;
  dismissible?: boolean;
  onDismiss?: () => void;
  onActionPress?: (action: AlertDialogAction) => void;
  useNativeModal?: boolean;
};

function getButtonStyle(variant: "primary" | "secondary") {
  if (variant === "secondary") {
    return {
      containerStyle: { backgroundColor: colors.gray },
      labelColor: colors.text.subdued,
    };
  }

  return {
    containerStyle: { backgroundColor: colors.bg.dark },
    labelColor: colors.white,
  };
}

function AlertDialogButton({
  action,
  variant,
  onActionPress,
  fullWidth = false,
  style,
}: {
  action: AlertDialogAction;
  variant: "primary" | "secondary";
  onActionPress?: (action: AlertDialogAction) => void;
  fullWidth?: boolean;
  style?: {
    left?: number;
    right?: number;
    top?: number;
  };
}) {
  const buttonStyle = getButtonStyle(variant);

  const handlePress = () => {
    onActionPress?.(action);
  };

  return (
    <View
      style={{
        ...buttonStyle.containerStyle,
        borderRadius: 12,
        height: 49,
        justifyContent: "center",
        overflow: "hidden",
        position: style ? "absolute" : "relative",
        width: fullWidth && style?.right !== undefined ? undefined : fullWidth ? "100%" : 140,
        ...style,
      }}
    >
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        style={({ pressed }) => ({
          alignItems: "center",
          flex: 1,
          height: 49,
          justifyContent: "center",
          opacity: pressed ? 0.75 : 1,
          width: "100%",
        })}
      >
        <Text
          className="font-pretendard text-body"
          style={{
            color: buttonStyle.labelColor,
            includeFontPadding: false,
            letterSpacing: 0,
            lineHeight: 20,
            textAlign: "center",
          }}
        >
          {action.label}
        </Text>
      </Pressable>
    </View>
  );
}

function AlertDialogContent({
  visible,
  title,
  message,
  confirmAction,
  cancelAction,
  dismissible = true,
  onDismiss,
  onActionPress,
  rootClassName,
}: AlertDialogProps & {
  rootClassName: string;
}) {
  const handleActionPress = (action: AlertDialogAction) => {
    if (onActionPress) {
      onActionPress(action);
      return;
    }

    onDismiss?.();
    void Promise.resolve()
      .then(action.onPress)
      .catch((error) => {
        console.warn("[Feedback] Alert action failed", error);
      });
  };

  const handleBackdropPress = () => {
    if (!dismissible) {
      return;
    }

    onDismiss?.();
  };

  if (!visible) {
    return null;
  }

  return (
    <View className={rootClassName}>
      <Pressable
        accessibilityLabel={dismissible ? "알림창 닫기" : undefined}
        accessibilityHint={dismissible ? "알림창을 닫습니다." : undefined}
        accessibilityRole={dismissible ? "button" : undefined}
        className="absolute inset-0 bg-black/25"
        onPress={handleBackdropPress}
        style={{ zIndex: 0 }}
      />
      <View
        accessibilityLabel={message ? `${title}. ${message}` : title}
        accessibilityRole="alert"
        accessibilityViewIsModal
        style={{
          backgroundColor: colors.white,
          overflow: "hidden",
          position: "relative",
          width: ALERT_WIDTH,
          height: ALERT_HEIGHT,
          borderRadius: message ? 20 : 16,
          elevation: 2,
          zIndex: 1,
        }}
      >
        <Text
          accessibilityRole="header"
          className="text-center font-pretendard text-heading"
          style={{
            color: colors.text.DEFAULT,
            left: 24,
            letterSpacing: 0,
            position: "absolute",
            right: 24,
            top: message ? 38 : 74,
          }}
        >
          {title}
        </Text>

        {message ? (
          <Text
            className="text-center font-pretendard text-body"
            style={{
              color: colors.text.subdued,
              left: 32,
              letterSpacing: -0.5,
              position: "absolute",
              top: 75,
              width: 280,
            }}
          >
            {message}
          </Text>
        ) : null}

        {cancelAction ? (
          <>
            <AlertDialogButton
              action={cancelAction}
              variant="secondary"
              onActionPress={handleActionPress}
              style={{ left: 24, top: 146 }}
            />
            <AlertDialogButton
              action={confirmAction}
              variant="primary"
              onActionPress={handleActionPress}
              style={{ left: 181, top: 146 }}
            />
          </>
        ) : (
          <AlertDialogButton
            action={confirmAction}
            variant="primary"
            fullWidth
            onActionPress={handleActionPress}
            style={{ left: 24, right: 24, top: 146 }}
          />
        )}
      </View>
    </View>
  );
}

export function AlertDialog({ useNativeModal = true, ...props }: AlertDialogProps) {
  const handleRequestClose = () => {
    if (props.dismissible === false) {
      return;
    }

    props.onDismiss?.();
  };

  if (!useNativeModal) {
    return (
      <AlertDialogContent
        {...props}
        useNativeModal={useNativeModal}
        rootClassName="absolute inset-0 items-center justify-center px-6"
      />
    );
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={props.visible}
      onRequestClose={handleRequestClose}
      statusBarTranslucent
    >
      <AlertDialogContent
        {...props}
        useNativeModal={useNativeModal}
        rootClassName="flex-1 items-center justify-center px-6"
      />
    </Modal>
  );
}
