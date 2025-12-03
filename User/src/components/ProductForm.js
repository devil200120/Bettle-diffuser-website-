// ProductForm.jsx
import React, { useState } from "react";
import "./ProductForm.css";

export default function ProductForm({ onSubmit }) {
  const [form, setForm] = useState({
    cameraModel: "",
    lensModel: "",
    flashModel: "",
    quantity: 1,
  });

  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = {
    cameraModel: !form.cameraModel ? "Field is required" : "",
    lensModel: !form.lensModel ? "Field is required" : "",
    flashModel: !form.flashModel ? "Field is required" : "",
    quantity: form.quantity < 1 ? "Minimum quantity is 1" : "",
  };

  const isValid =
    !errors.cameraModel &&
    !errors.lensModel &&
    !errors.flashModel &&
    !errors.quantity;

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  }

  function handleBlur(e) {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({
      cameraModel: true,
      lensModel: true,
      flashModel: true,
      quantity: true,
    });

    if (!isValid) return;

    try {
      setSubmitting(true);
      // Simulate submit; replace with real handler
      await new Promise((res) => setTimeout(res, 600));
      onSubmit?.(form);
      // Optionally reset: setForm({ cameraModel:'', lensModel:'', flashModel:'', quantity:1 });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} noValidate>
      <h2 className="product-form__title">Provide your equipment</h2>

      <div className="product-form__grid">
        {/* Camera model */}
        <div className="form-field">
          <label htmlFor="cameraModel" className="form-label">
            Provide your camera model <span className="required">*</span>
          </label>
          <p className="form-helper">
            Only provide information for one Camera model
          </p>
          <input
            id="cameraModel"
            name="cameraModel"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="Olympus OM-1, Canon EOS R5, Sony A7 IV, or Nikon Z7"
            className={`form-input ${
              touched.cameraModel && errors.cameraModel ? "has-error" : ""
            }`}
            value={form.cameraModel}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(touched.cameraModel && errors.cameraModel)}
            aria-describedby="cameraModel-error cameraModel-help"
          />
          <p id="cameraModel-help" className="sr-only">
            Enter exactly one camera model.
          </p>
          {touched.cameraModel && errors.cameraModel && (
            <p id="cameraModel-error" className="form-error">
              {errors.cameraModel}
            </p>
          )}
        </div>

        {/* Lens model */}
        <div className="form-field">
          <label htmlFor="lensModel" className="form-label">
            Provide your lens make & model <span className="required">*</span>
          </label>
          <p className="form-helper">Only provide information for one Lens</p>
          <input
            id="lensModel"
            name="lensModel"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="OM SYSTEM 90mm Pro Macro, CANON RF100MM, NIK"
            className={`form-input ${
              touched.lensModel && errors.lensModel ? "has-error" : ""
            }`}
            value={form.lensModel}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(touched.lensModel && errors.lensModel)}
            aria-describedby="lensModel-error lensModel-help"
          />
          <p id="lensModel-help" className="sr-only">
            Enter exactly one lens make and model.
          </p>
          {touched.lensModel && errors.lensModel && (
            <p id="lensModel-error" className="form-error">
              {errors.lensModel}
            </p>
          )}
        </div>

        {/* Flash model */}
        <div className="form-field">
          <label htmlFor="flashModel" className="form-label">
            Provide your flash make & model <span className="required">*</span>
          </label>
          <p className="form-helper">Only provide information for one Flash</p>
          <input
            id="flashModel"
            name="flashModel"
            type="text"
            inputMode="text"
            autoComplete="off"
            placeholder="Godox V860III, Godox V350, Canon 600EX II-RT, Nikon S"
            className={`form-input ${
              touched.flashModel && errors.flashModel ? "has-error" : ""
            }`}
            value={form.flashModel}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={Boolean(touched.flashModel && errors.flashModel)}
            aria-describedby="flashModel-error flashModel-help"
          />
          <p id="flashModel-help" className="sr-only">
            Enter exactly one flash make and model.
          </p>
          {touched.flashModel && errors.flashModel && (
            <p id="flashModel-error" className="form-error">
              {errors.flashModel}
            </p>
          )}
        </div>

        {/* Quantity */}
        <div className="form-field form-field--qty">
          <label htmlFor="quantity" className="form-label">
            Quantity
          </label>
          <div className="qty-control">
            <button
              type="button"
              className="qty-btn"
              onClick={() =>
                setForm((prev) => ({
                  ...prev,
                  quantity: Math.max(1, prev.quantity - 1),
                }))
              }
              aria-label="Decrease quantity"
            >
              –
            </button>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              step={1}
              className={`form-input qty-input ${
                touched.quantity && errors.quantity ? "has-error" : ""
              }`}
              value={form.quantity}
              onChange={handleChange}
              onBlur={handleBlur}
              aria-invalid={Boolean(touched.quantity && errors.quantity)}
              aria-describedby="quantity-error"
            />
            <button
              type="button"
              className="qty-btn"
              onClick={() =>
                setForm((prev) => ({ ...prev, quantity: prev.quantity + 1 }))
              }
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          {touched.quantity && errors.quantity && (
            <p id="quantity-error" className="form-error">
              {errors.quantity}
            </p>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="product-form__actions">
        <button
          type="submit"
          className="cta-btn"
          disabled={!isValid || submitting}
          aria-disabled={!isValid || submitting}
        >
          {submitting ? "Adding…" : "Add to cart"}
        </button>
        <p className="payment-note">
          Pay in 4 interest-free payments of $25.94 with PayPal.{" "}
          <a href="#" className="link">
            Learn more
          </a>
        </p>
      </div>
    </form>
  );
}
