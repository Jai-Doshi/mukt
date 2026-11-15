export function triggerHaptic(type = "light") {
  try {
    if (!navigator.vibrate) return;
    if (type === "light") navigator.vibrate(8);
    else if (type === "medium") navigator.vibrate(15);
    else if (type === "heavy") navigator.vibrate(25);
    else if (type === "success") navigator.vibrate([10, 30, 15]);
  } catch {
    // Ignore if vibration is restricted by browser policy
  }
}
