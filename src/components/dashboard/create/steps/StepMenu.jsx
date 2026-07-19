import { motion, AnimatePresence } from 'framer-motion';
import { StepHeading, StepActions, stepMotion } from '../ui';
import { SUGGESTED_MENU } from '../../../../lib/wizardSuggestions';
import { sfxClick } from '../../../../lib/sfx';

const CATEGORIES = ['Starters', 'Main Course', 'Dessert', 'Drinks', 'Other'];

export default function StepMenu({ data, update, onNext, onBack, onSkip }) {
  function updateItem(i, item) {
    const next = data.menu.slice();
    next[i] = item;
    update({ menu: next });
  }
  function removeItem(i) {
    update({ menu: data.menu.filter((_, idx) => idx !== i) });
  }
  function addItem() {
    sfxClick();
    update({ menu: [...data.menu, { category: 'Main Course', name: '' }] });
  }
  function suggestFullMenu() {
    sfxClick();
    update({ menu: [...data.menu, ...SUGGESTED_MENU.map((m) => ({ ...m }))] });
  }

  return (
    <motion.div {...stepMotion}>
      <StepHeading title="Wedding Menu" sub="Optional — list the dishes you'll be serving so your guests know what to expect" />

      {data.menu.length === 0 && (
        <div className="mb-3 text-[0.8rem]" style={{ color: 'rgba(246,244,239,0.4)' }}>
          No dishes added yet.
        </div>
      )}

      <AnimatePresence initial={false}>
        {data.menu.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-2.5 flex items-center gap-2.5"
          >
            <select
              value={item.category}
              onChange={(e) => updateItem(i, { ...item, category: e.target.value })}
              className="rounded-lg border px-3 py-2.5 text-[0.82rem] outline-none"
              style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)' }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={item.name}
              placeholder="Dish name"
              onChange={(e) => updateItem(i, { ...item, name: e.target.value })}
              className="flex-1 rounded-lg border px-3 py-2.5 text-[0.85rem] outline-none"
              style={{ background: 'rgba(0,0,0,0.25)', borderColor: 'rgba(212,175,55,0.22)', color: 'var(--white)' }}
            />
            <button type="button" onClick={() => removeItem(i)} className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-sm" style={{ color: 'rgba(246,244,239,0.5)' }}>
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="mt-3 flex flex-wrap gap-3">
        <button type="button" className="btn-ghost" onClick={addItem}>
          + Add Dish
        </button>
        <button type="button" className="btn-ghost" onClick={suggestFullMenu}>
          ✨ إضافة قائمة طعام جاهزة / Add a full suggested menu
        </button>
      </div>

      <StepActions onBack={onBack} onNext={onNext} onSkip={onSkip} />
    </motion.div>
  );
}
