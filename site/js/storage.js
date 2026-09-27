// localStorage helpers, wrapped in try/catch so a blocked storage never breaks the app.

export const KEYS = {state:"afrocuban.state.v1"};

export const store = {
  get(k, d){ try{ const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; }catch(e){ return d; } },
  set(k, v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch(e){} }
};
