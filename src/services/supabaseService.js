import { supabase, isSupabaseConfigured } from "../lib/supabase";

// ==============================================================================
// Data Mappers: Frontend (camelCase) <-> Database (snake_case / camelCase)
// ==============================================================================

export function mapPaymentToDb(p) {
  const row = {
    id: p.id,
    payer_id: p.payerId || p.payer_id || "me",
    to_id: p.toId || p.to_id || null,
    loan: Number(p.loan) || 0,
    local: Number(p.local) || 0,
    rate: p.rate != null ? Number(p.rate) : null,
    entered: p.entered || "loan",
    date: p.date,
    mode: p.mode || null,
    note: p.note || null,
    created: p.created || Date.now(),
  };
  return row;
}

export function mapPaymentFromDb(row) {
  return {
    id: String(row.id),
    payerId: row.payer_id || row.payerId || "me",
    toId: row.to_id || row.toId || null,
    loan: Number(row.loan) || 0,
    local: Number(row.local) || 0,
    rate: row.rate != null ? Number(row.rate) : null,
    entered: row.entered || "loan",
    date: row.date,
    mode: row.mode || "",
    note: row.note || "",
    created: Number(row.created) || Date.now(),
  };
}

export function mapBorrowingToDb(b) {
  return {
    id: b.id,
    from_id: b.fromId || b.from_id || "me",
    loan: Number(b.loan) || 0,
    local: Number(b.local) || 0,
    rate: b.rate != null ? Number(b.rate) : null,
    entered: b.entered || "loan",
    date: b.date,
    reason: b.reason || null,
    note: b.note || null,
    created: b.created || Date.now(),
  };
}

export function mapBorrowingFromDb(row) {
  return {
    id: String(row.id),
    fromId: row.from_id || row.fromId || "me",
    loan: Number(row.loan) || 0,
    local: Number(row.local) || 0,
    rate: row.rate != null ? Number(row.rate) : null,
    entered: row.entered || "loan",
    date: row.date,
    reason: row.reason || "",
    note: row.note || "",
    created: Number(row.created) || Date.now(),
  };
}

export function mapPersonToDb(person) {
  return {
    id: person.id,
    name: person.name,
    color: person.color,
  };
}

export function mapPersonFromDb(row) {
  return {
    id: String(row.id),
    name: row.name,
    color: row.color,
  };
}

export function mapSettingsToDb(settings) {
  return {
    id: "default",
    loan_cur: settings.loanCur || settings.loan_cur || "INR",
    local_cur: settings.localCur || settings.local_cur || "CAD",
    display: settings.display || "loan",
    rate: settings.rate != null ? Number(settings.rate) : null,
    rate_date: settings.rateDate || settings.rate_date || null,
    rate_last_fetched: settings.rateLastFetched || settings.rate_last_fetched || null,
    theme: settings.theme || "auto",
    theme_accent: settings.themeAccent || settings.theme_accent || "emerald",
    onboarded: Boolean(settings.onboarded),
    updated_at: new Date().toISOString(),
  };
}

export function mapSettingsFromDb(row) {
  return {
    loanCur: row.loan_cur || row.loanCur || "INR",
    localCur: row.local_cur || row.localCur || "CAD",
    display: row.display || "loan",
    rate: row.rate != null ? Number(row.rate) : null,
    rateDate: row.rate_date || row.rateDate || null,
    rateLastFetched: row.rate_last_fetched || row.rateLastFetched || null,
    theme: row.theme || "auto",
    themeAccent: row.theme_accent || row.themeAccent || "emerald",
    onboarded: Boolean(row.onboarded),
  };
}

// ==============================================================================
// Connection & Health Check
// ==============================================================================

export async function checkSupabaseHealth() {
  if (!isSupabaseConfigured || !supabase) {
    return { configured: false, ready: false, message: "Supabase credentials not configured." };
  }

  try {
    const { data, error } = await supabase.from("people").select("id").limit(1);
    if (error) {
      // Check if table missing (PGRST205)
      if (error.code === "PGRST205" || error.message?.includes("Could not find the table")) {
        // Test fallback mukt_state table
        const fallback = await supabase.from("mukt_state").select("id").limit(1);
        if (!fallback.error) {
          return { configured: true, ready: true, usingFallback: true, message: "Connected via mukt_state sync." };
        }
        return {
          configured: true,
          ready: false,
          missingTables: true,
          message: "Connected to Supabase, but schema tables need to be created. Run schema.sql in Supabase SQL editor.",
        };
      }
      return { configured: true, ready: false, error: error.message, message: `Database error: ${error.message}` };
    }
    return { configured: true, ready: true, message: "Connected to Supabase Cloud Database." };
  } catch (err) {
    return { configured: true, ready: false, error: err.message, message: `Connection failed: ${err.message}` };
  }
}

// ==============================================================================
// Full State Fetch (Viewing Data)
// ==============================================================================

export async function fetchFullStateFromSupabase() {
  if (!isSupabaseConfigured || !supabase) return null;

  try {
    const [peopleRes, borrowingsRes, paymentsRes, settingsRes] = await Promise.all([
      supabase.from("people").select("*"),
      supabase.from("borrowings").select("*").order("date", { ascending: false }),
      supabase.from("payments").select("*").order("date", { ascending: false }),
      supabase.from("settings").select("*").eq("id", "default").maybeSingle(),
    ]);

    // If tables don't exist, try fallback mukt_state
    if (peopleRes.error?.code === "PGRST205" || borrowingsRes.error?.code === "PGRST205") {
      const { data: stateData } = await supabase.from("mukt_state").select("data").eq("id", "current").maybeSingle();
      if (stateData?.data) {
        return stateData.data;
      }
      return null;
    }

    if (peopleRes.error || borrowingsRes.error || paymentsRes.error) {
      console.warn("Supabase fetch warning:", peopleRes.error || borrowingsRes.error || paymentsRes.error);
      return null;
    }

    // Deduplicate people by name and ID
    const seenNames = new Set();
    const seenIds = new Set();
    const people = [];
    (peopleRes.data || []).forEach((row) => {
      const p = mapPersonFromDb(row);
      const nameKey = (p.id === "me" ? "me" : (p.name || "").trim()).toLowerCase();
      if (!seenNames.has(nameKey) && !seenIds.has(p.id)) {
        seenNames.add(nameKey);
        seenIds.add(p.id);
        people.push(p);
      }
    });

    const borrowings = (borrowingsRes.data || []).map(mapBorrowingFromDb);
    const payments = (paymentsRes.data || []).map(mapPaymentFromDb);
    const settings = settingsRes.data ? mapSettingsFromDb(settingsRes.data) : null;

    let interestConfig = null;
    try {
      const { data: stateData } = await supabase.from("mukt_state").select("data").eq("id", "current").maybeSingle();
      if (stateData?.data?.interestConfig) {
        interestConfig = stateData.data.interestConfig;
      }
    } catch {
      // optional
    }

    return {
      people: people.length > 0 ? people : null,
      borrowings,
      payments,
      settings,
      interestConfig,
    };
  } catch (err) {
    console.warn("Failed to fetch full state from Supabase:", err);
    return null;
  }
}

// ==============================================================================
// CRUD: Payments (Repayments)
// ==============================================================================

export async function insertPaymentToSupabase(payment) {
  if (!supabase) return { success: false };
  try {
    const row = mapPaymentToDb(payment);
    const { error } = await supabase.from("payments").insert(row);
    if (error) {
      console.warn("Supabase insertPayment error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase insertPayment exception:", err);
    return { success: false, error: err };
  }
}

export async function updatePaymentInSupabase(id, updates) {
  if (!supabase) return { success: false };
  try {
    const patch = {};
    if (updates.payerId !== undefined) patch.payer_id = updates.payerId;
    if (updates.toId !== undefined) patch.to_id = updates.toId;
    if (updates.loan !== undefined) patch.loan = Number(updates.loan) || 0;
    if (updates.local !== undefined) patch.local = Number(updates.local) || 0;
    if (updates.rate !== undefined) patch.rate = updates.rate != null ? Number(updates.rate) : null;
    if (updates.entered !== undefined) patch.entered = updates.entered;
    if (updates.date !== undefined) patch.date = updates.date;
    if (updates.mode !== undefined) patch.mode = updates.mode;
    if (updates.note !== undefined) patch.note = updates.note;

    const { error } = await supabase.from("payments").update(patch).eq("id", id);
    if (error) {
      console.warn("Supabase updatePayment error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase updatePayment exception:", err);
    return { success: false, error: err };
  }
}

export async function deletePaymentFromSupabase(id) {
  if (!supabase) return { success: false };
  try {
    const { error } = await supabase.from("payments").delete().eq("id", id);
    if (error) {
      console.warn("Supabase deletePayment error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase deletePayment exception:", err);
    return { success: false, error: err };
  }
}

// ==============================================================================
// CRUD: Borrowings (Loans)
// ==============================================================================

export async function insertBorrowingToSupabase(borrowing) {
  if (!supabase) return { success: false };
  try {
    const row = mapBorrowingToDb(borrowing);
    const { error } = await supabase.from("borrowings").insert(row);
    if (error) {
      console.warn("Supabase insertBorrowing error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase insertBorrowing exception:", err);
    return { success: false, error: err };
  }
}

export async function updateBorrowingInSupabase(id, updates) {
  if (!supabase) return { success: false };
  try {
    const patch = {};
    if (updates.fromId !== undefined) patch.from_id = updates.fromId;
    if (updates.loan !== undefined) patch.loan = Number(updates.loan) || 0;
    if (updates.local !== undefined) patch.local = Number(updates.local) || 0;
    if (updates.rate !== undefined) patch.rate = updates.rate != null ? Number(updates.rate) : null;
    if (updates.entered !== undefined) patch.entered = updates.entered;
    if (updates.date !== undefined) patch.date = updates.date;
    if (updates.reason !== undefined) patch.reason = updates.reason;
    if (updates.note !== undefined) patch.note = updates.note;

    const { error } = await supabase.from("borrowings").update(patch).eq("id", id);
    if (error) {
      console.warn("Supabase updateBorrowing error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase updateBorrowing exception:", err);
    return { success: false, error: err };
  }
}

export async function deleteBorrowingFromSupabase(id) {
  if (!supabase) return { success: false };
  try {
    const { error } = await supabase.from("borrowings").delete().eq("id", id);
    if (error) {
      console.warn("Supabase deleteBorrowing error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase deleteBorrowing exception:", err);
    return { success: false, error: err };
  }
}

// ==============================================================================
// CRUD: People (Stakeholders)
// ==============================================================================

export async function insertPersonToSupabase(person) {
  if (!supabase) return { success: false };
  try {
    const row = mapPersonToDb(person);
    const { error } = await supabase.from("people").upsert(row);
    if (error) {
      console.warn("Supabase insertPerson error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase insertPerson exception:", err);
    return { success: false, error: err };
  }
}

export async function updatePersonInSupabase(id, updates) {
  if (!supabase) return { success: false };
  try {
    const patch = {};
    if (updates.name !== undefined) patch.name = updates.name;
    if (updates.color !== undefined) patch.color = updates.color;

    const { error } = await supabase.from("people").update(patch).eq("id", id);
    if (error) {
      console.warn("Supabase updatePerson error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase updatePerson exception:", err);
    return { success: false, error: err };
  }
}

export async function deletePersonFromSupabase(id) {
  if (!supabase) return { success: false };
  try {
    const { error } = await supabase.from("people").delete().eq("id", id);
    if (error) {
      console.warn("Supabase deletePerson error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase deletePerson exception:", err);
    return { success: false, error: err };
  }
}

// ==============================================================================
// Settings Upsert
// ==============================================================================

export async function upsertSettingsInSupabase(settings) {
  if (!supabase) return { success: false };
  try {
    const row = mapSettingsToDb(settings);
    const { error } = await supabase.from("settings").upsert(row, { onConflict: "id" });
    if (error) {
      console.warn("Supabase upsertSettings error:", error.message);
      return { success: false, error };
    }
    return { success: true };
  } catch (err) {
    console.warn("Supabase upsertSettings exception:", err);
    return { success: false, error: err };
  }
}

// ==============================================================================
// Bulk Operations: Full Sync / Backup / Wipe
// ==============================================================================

export async function syncAllToSupabase(fullState) {
  if (!supabase) return { success: false, message: "Supabase not configured" };

  try {
    // 1. Clean up and upsert People
    if (fullState.people && fullState.people.length > 0) {
      const currentIds = fullState.people.map((p) => p.id);
      // Remove any stakeholders in database that are not part of current state
      await supabase.from("people").delete().not("id", "in", `(${currentIds.map((id) => `"${id}"`).join(",")})`);
      const peopleRows = fullState.people.map(mapPersonToDb);
      await supabase.from("people").upsert(peopleRows, { onConflict: "id" });
    }

    // 2. Clear existing and insert Borrowings
    await supabase.from("borrowings").delete().neq("id", "none");
    if (fullState.borrowings && fullState.borrowings.length > 0) {
      const borrowingRows = fullState.borrowings.map(mapBorrowingToDb);
      await supabase.from("borrowings").insert(borrowingRows);
    }

    // 3. Clear existing and insert Payments
    await supabase.from("payments").delete().neq("id", "none");
    if (fullState.payments && fullState.payments.length > 0) {
      const paymentRows = fullState.payments.map(mapPaymentToDb);
      await supabase.from("payments").insert(paymentRows);
    }

    // 4. Upsert Settings
    if (fullState.settings) {
      const settingsRow = mapSettingsToDb(fullState.settings);
      await supabase.from("settings").upsert(settingsRow, { onConflict: "id" });
    }

    // 5. Also update fallback mukt_state if available
    try {
      await supabase.from("mukt_state").upsert({
        id: "current",
        data: fullState,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    } catch {
      // optional fallback table
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to sync all data to Supabase:", err);
    return { success: false, error: err };
  }
}

export async function wipeSupabaseData() {
  if (!supabase) return { success: false };

  try {
    await Promise.all([
      supabase.from("payments").delete().neq("id", "none"),
      supabase.from("borrowings").delete().neq("id", "none"),
      supabase.from("people").delete().neq("id", "me"),
    ]);

    await supabase.from("settings").upsert({
      id: "default",
      onboarded: false,
      updated_at: new Date().toISOString(),
    });

    try {
      await supabase.from("mukt_state").delete().eq("id", "current");
    } catch {
      // optional fallback table
    }

    return { success: true };
  } catch (err) {
    console.error("Failed to wipe Supabase data:", err);
    return { success: false, error: err };
  }
}
