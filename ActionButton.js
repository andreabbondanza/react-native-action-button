import React, { Component, useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet,
  Text,
  View,
  Animated,
  TouchableOpacity
} from "react-native";
import ActionButtonItem from "./ActionButtonItem";
import {
  shadowStyle,
  alignItemsMap,
  getTouchableComponent,
  isAndroid,
  touchableBackground,
  DEFAULT_ACTIVE_OPACITY
} from "./shared";

const ActionButton = props =>
{
  const {
    resetToken = null,
    active: activeProp = false,
    bgColor = "transparent",
    bgOpacity = 1,
    buttonColor = "rgba(0,0,0,1)",
    buttonTextStyle = {},
    buttonText = "+",
    spacing = 20,
    outRangeScale = 1,
    autoInactive = true,
    onPress = () => {},
    onPressIn = () => {},
    onPressOut = () => {},
    onReset,                // può restare undefined
    backdrop = false,
    degrees = 45,
    position = "right",
    offsetX = 30,
    offsetY = 30,
    size = 56,
    verticalOrientation = "up",
    backgroundTappable = false,
    useNativeFeedback = true,
    activeOpacity = DEFAULT_ACTIVE_OPACITY,
    fixNativeFeedbackRadius = false,
    nativeFeedbackRippleColor = "rgba(255,255,255,0.75)",
    testID,
    accessibilityLabel,
    accessible,
    elevation = 0,
    zIndex = 0,
    btnOutRange,           // opzionale
    btnOutRangeTxt,        // opzionale
    style,
    children,
    hideShadow = false,
    onLongPress = () => {},
    ...rest
  } = props;
  const [, setResetToken] = useState(resetToken);
  const [active, setActive] = useState(active);
  const anim = useRef(new Animated.Value(active ? 1 : 0));
  const timeout = useRef(null);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;

    return () => {
      mounted.current = false;
      timeout.current && clearTimeout(timeout.current);
    };
  }, []);

  useEffect(() => {
    if (active) {
      Animated.spring(anim.current, { toValue: 1, useNativeDriver:true }).start();
      setActive(true);
      setResetToken(resetToken);
    } else {
      onReset && onReset();

      Animated.spring(anim.current, { toValue: 0, useNativeDriver:true }).start();
      timeout.current = setTimeout(() => {
        setActive(false);
        setResetToken(resetToken);
      }, 250);
    }
  }, [resetToken, active]);

  //////////////////////
  // STYLESHEET GETTERS
  //////////////////////

  const getOrientation = () => {
    return { alignItems: alignItemsMap[position] };
  };

  const getOffsetXY = () => {
    return {
      paddingHorizontal: offsetX,
      ...(verticalOrientation === 'up'
          ? { paddingBottom: offsetY }
          : { paddingTop: offsetY }),
    };
  };

  const getOverlayStyles = () => {
    return [
      styles.overlay,
      {
        elevation: elevation,
        zIndex: zIndex,
        justifyContent:
          verticalOrientation === "up" ? "flex-end" : "flex-start"
      }
    ];
  };

  const _renderMainButton = () =>
  {
    console.log("buttonColor--->>>>>", buttonColor);
    console.log("btnOutRange--->>>>>", btnOutRange);
    console.log("outRangeScale--->>>>>", outRangeScale);
    console.log("degrees--->>>>>", degrees);
    console.log("anim.current--->>>>>", anim.current);
    const animatedViewStyle = {
      transform: [
        {
          scale: anim.current.interpolate({
            inputRange: [0, 1],
            outputRange: [1, outRangeScale]
          })
        },
        {
          rotate: anim.current.interpolate({
            inputRange: [0, 1],
            outputRange: ["0deg", degrees !== undefined ? degrees + "deg" : "0deg"]
          })
        }
      ]
    };

    const wrapperStyle = {
      backgroundColor: anim.current.interpolate({
        inputRange: [0, 1],
        outputRange: [buttonColor, btnOutRange !== undefined ? btnOutRange : buttonColor]
      }),
      width: size,
      height: size,
      borderRadius: size / 2
    };

    const buttonStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
      alignItems: "center",
      justifyContent: "center"
    };

    const Touchable = getTouchableComponent(useNativeFeedback);
    const parentStyle =
      isAndroid && fixNativeFeedbackRadius
        ? {
            right: offsetX,
            zIndex: zIndex,
            borderRadius: size / 2,
            width: size
          }
        : { marginHorizontal: offsetX, zIndex: zIndex };

    return (
      <View
        style={[
          parentStyle,
          !hideShadow && shadowStyle,
          !hideShadow && shadowStyle
        ]}
      >
        <Touchable
          testID={testID}
          accessible={accessible}
          accessibilityLabel={accessibilityLabel}
          background={touchableBackground(
            nativeFeedbackRippleColor,
            fixNativeFeedbackRadius
          )}
          activeOpacity={activeOpacity}
          onLongPress={onLongPress}
          onPress={() => {
            onPress();
            if (children) animateButton();
          }}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
        >
          <Animated.View style={wrapperStyle}>
            <Animated.View style={[buttonStyle, animatedViewStyle]}>
              {_renderButtonIcon()}
            </Animated.View>
          </Animated.View>
        </Touchable>
      </View>
    );
  };

  const _renderButtonIcon = () => {
    const {
      icon,
      renderIcon,
      btnOutRangeTxt,
      buttonTextStyle,
      buttonText
    } = props;
    if (renderIcon) return renderIcon(active);
    if (icon) {
      console.warn(
        "react-native-action-button: The `icon` prop is deprecated! Use `renderIcon` instead."
      );
      return icon;
    }

    const textColor = buttonTextStyle.color || "rgba(255,255,255,1)";
    console.log("textColor--->>>>>", textColor);
    console.log("buttonTextStyle--->>>>>", buttonTextStyle);
    console.log("btnOutRangeTxt--->>>>>", btnOutRangeTxt);
    console.log("buttonText--->>>>>", buttonText);
    console.log("anim.current--->>>>>", anim.current);
    return (
      <Animated.Text
        style={[
          styles.btnText,
          buttonTextStyle,
          {
            color: anim.current.interpolate({
              inputRange: [0, 1],
              outputRange: [textColor, btnOutRangeTxt !== undefined ? btnOutRangeTxt : textColor]
            })
          }
        ]}
      >
        {buttonText}
      </Animated.Text>
    );
  };

  const _renderActions = () => {
    const { children, verticalOrientation } = props;

    if (!active) return null;

    let actionButtons = !Array.isArray(children) ? [children] : children;

    actionButtons = actionButtons.filter(
      actionButton => typeof actionButton == "object"
    );

    const actionStyle = {
      flex: 1,
      alignSelf: "stretch",
      // backgroundColor: 'purple',
      justifyContent: verticalOrientation === "up" ? "flex-start" : "flex-end",
      paddingTop: verticalOrientation === "down" ? spacing : 0,
      zIndex: zIndex
    };

    return (
      <View style={actionStyle} pointerEvents={"box-none"}>
        {actionButtons.map((ActionButton, idx) => (
          <ActionButtonItem
            key={idx}
            anim={anim.current}
            {...props}
            {...ActionButton.props}
            parentSize={size}
            btnColor={btnOutRange}
            onPress={() => {
              if (autoInactive) {
                timeout.current = setTimeout(reset, 200);
              }
              ActionButton.props.onPress();
            }}
          />
        ))}
      </View>
    );
  };

  const _renderTappableBackground = () => {
    return (
      <TouchableOpacity
        activeOpacity={1}
        style={getOverlayStyles()}
        onPress={reset}
      />
    );
  };

  //////////////////////
  // Animation Methods
  //////////////////////

  const animateButton = (animate = true) => {
    if (active) return reset(animate);

    if (animate) {
      Animated.spring(anim.current, { toValue: 1, useNativeDriver:true }).start();
    } else {
      anim.current.setValue(1);
    }

    setActive(true);
  };

  const reset = (animate = true) => {
    if (onReset) onReset();

    if (animate) {
      Animated.spring(anim.current, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      anim.current.setValue(0);
    }

    timeout.current = setTimeout(() => {
      if (mounted.current) {
        setActive(false);
      }
    }, 250);
  };

  return (
    <View pointerEvents="box-none" style={[getOverlayStyles(), style]}>
      <Animated.View
        pointerEvents="none"
        style={[
          getOverlayStyles(),
          {
            backgroundColor: bgColor,
            opacity: anim.current.interpolate({
              inputRange: [0, 1],
              outputRange: [0, bgOpacity]
            })
          }
        ]}
      >
        {backdrop}
      </Animated.View>
      <View
        pointerEvents="box-none"
        style={[getOverlayStyles(), getOrientation(), getOffsetXY()]}
      >
        {active && !backgroundTappable && _renderTappableBackground()}

        {verticalOrientation === "up" &&
          children &&
          _renderActions()}
        {_renderMainButton()}
        {verticalOrientation === "down" &&
          children &&
          _renderActions()}
      </View>
    </View>
  );
};

ActionButton.Item = ActionButtonItem;

ActionButton.propTypes = {
  resetToken: PropTypes.any,
  active: PropTypes.bool,

  position: PropTypes.string,
  elevation: PropTypes.number,
  zIndex: PropTypes.number,

  hideShadow: PropTypes.bool,
  shadowStyle: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
    PropTypes.number
  ]),

  renderIcon: PropTypes.func,

  bgColor: PropTypes.string,
  bgOpacity: PropTypes.number,
  buttonColor: PropTypes.string,
  buttonTextStyle: Text?.propTypes?.style,
  buttonText: PropTypes.string,

  offsetX: PropTypes.number,
  offsetY: PropTypes.number,
  spacing: PropTypes.number,
  size: PropTypes.number,
  autoInactive: PropTypes.bool,
  onPress: PropTypes.func,
  onPressIn: PropTypes.func,
  onPressOut: PropTypes.func,
  backdrop: PropTypes.oneOfType([PropTypes.bool, PropTypes.object]),
  degrees: PropTypes.number,
  verticalOrientation: PropTypes.oneOf(["up", "down"]),
  backgroundTappable: PropTypes.bool,
  activeOpacity: PropTypes.number,

  useNativeFeedback: PropTypes.bool,
  fixNativeFeedbackRadius: PropTypes.bool,
  nativeFeedbackRippleColor: PropTypes.string,

  testID: PropTypes.string,
  accessibilityLabel: PropTypes.string,
  accessible: PropTypes.bool
};

ActionButton.defaultProps = {
  resetToken: null,
  active: false,
  bgColor: "transparent",
  bgOpacity: 1,
  buttonColor: "rgba(0,0,0,1)",
  buttonTextStyle: {},
  buttonText: "+",
  spacing: 20,
  outRangeScale: 1,
  autoInactive: true,
  onPress: () => {},
  onPressIn: () => {},
  onPressOn: () => {},
  backdrop: false,
  degrees: 45,
  position: "right",
  offsetX: 30,
  offsetY: 30,
  size: 56,
  verticalOrientation: "up",
  backgroundTappable: false,
  useNativeFeedback: true,
  activeOpacity: DEFAULT_ACTIVE_OPACITY,
  fixNativeFeedbackRadius: false,
  nativeFeedbackRippleColor: "rgba(255,255,255,0.75)",
  testID: undefined,
  accessibilityLabel: undefined,
  accessible: undefined
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    backgroundColor: "transparent"
  },
  btnText: {
    marginTop: -4,
    fontSize: 24,
    backgroundColor: "transparent"
  }
});
export default ActionButton;
