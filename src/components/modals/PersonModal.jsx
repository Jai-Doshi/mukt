import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { useMukt } from "../../context/MuktContext";
import { COLORS } from "../../constants";
import { Avatar } from "../common/Avatar";
import { BottomSheet } from "../common/BottomSheet";
import { triggerHaptic } from "../../utils/haptics";

export function PersonModal({ data }) {
  const { closeModal, state, addPerson, updatePerson, deletePerson } = useMukt();
  const person = data?.person || null;
  const isEdit = Boolean(person);

  const [name, setName] = useState(person?.name || "");
  const [color, setColor] = useState(
    person?.color || COLORS[state.people.length % COLORS.length]
  );
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      setError("Please enter a name.");
      return;
    }

    triggerHaptic("success");

    if (isEdit) {
      updatePerson(person.id, { name: cleanName, color });
    } else {
      addPerson(cleanName, color);
      closeModal();
    }
  };

  return (
    <BottomSheet
      isOpen={true}
      onClose={closeModal}
      title={isEdit ? "Edit Person" : "New Person"}
      subtitle="Customize avatar color and label"
    >
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Avatar Preview */}
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          <Avatar person={{ name: name || "P", color }} size="lg" />
          <div>
            <span style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--text-main)" }}>
              {name || "Person Name"}
            </span>
            <p style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
              Live preview of initials and color swatch
            </p>
          </div>
        </div>

        {/* Name Field */}
        <div>
          <label
            htmlFor="person-name"
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--text-dim)",
              display: "block",
              marginBottom: "4px",
            }}
          >
            Name
          </label>
          <input
            id="person-name"
            type="text"
            placeholder="e.g. Dad, Uncle, HDFC Credila"
            maxLength={40}
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="form-input"
          />
        </div>

        {/* Color Palette */}
        <div>
          <label
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              color: "var(--text-dim)",
              display: "block",
              marginBottom: "8px",
            }}
          >
            Color Accent
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  triggerHaptic("light");
                  setColor(c);
                }}
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: c,
                  border: color === c ? "3px solid #fff" : "2px solid transparent",
                  boxShadow: color === c ? `0 0 14px ${c}` : "none",
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                  transform: color === c ? "scale(1.15)" : "scale(1)",
                }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        {error && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-md)",
              backgroundColor: "var(--danger-light)",
              color: "var(--danger)",
              fontSize: "0.8125rem",
            }}
          >
            {error}
          </div>
        )}

        {/* Footer Actions */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            paddingTop: "14px",
            borderTop: "1px solid var(--border-subtle)",
          }}
        >
          {isEdit && person.id !== "me" ? (
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => {
                triggerHaptic("heavy");
                deletePerson(person.id);
              }}
            >
              <Trash2 size={15} /> Remove
            </button>
          ) : (
            <div />
          )}

          <div style={{ display: "flex", gap: "8px" }}>
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" style={{ padding: "10px 20px" }}>
              {isEdit ? "Save Changes" : "Add Person"}
            </button>
          </div>
        </div>
      </form>
    </BottomSheet>
  );
}
