// قائمة الإيموجي المتاحة للفئات - معارض وأحداث عالمية
export const availableEmojis = [
  { icon: "fa-solid:fighter-jet", name: "معرض الطيران العسكري", category: "عسكري" },
  { icon: "fa7-solid:horse-head", name: "مسابقة الفروسية العالمية", category: "رياضي" },
  { icon: "mdi:rocket-launch", name: "معرض الطائرات والفضاء", category: "فضائي" },
  { icon: "material-symbols:celebration", name: "مؤتمر عالمي", category: "مناسبات" },
  { icon: "material-symbols:store", name: "معرض تجاري عالمي", category: "تجاري" },
  { icon: "material-symbols:sports", name: "بطولة رياضية دولية", category: "رياضي" },
  { icon: "material-symbols:auto-awesome", name: "معرض التكنولوجيا", category: "تقني" },
  { icon: "material-symbols:science", name: "مؤتمر علمي دولي", category: "علمي" },
  { icon: "material-symbols:car-repair", name: "معرض السيارات", category: "نقل" },
  { icon: "material-symbols:construction", name: "معرض الإنشاءات", category: "إنشائي" },
  { icon: "material-symbols:factory", name: "معرض الصناعة", category: "صناعي" },
  { icon: "material-symbols:health-and-safety", name: "مؤتمر طبي دولي", category: "طبي" },
  { icon: "material-symbols:school", name: "مؤتمر تعليمي عالمي", category: "تعليمي" },
  { icon: "material-symbols:account-balance", name: "مؤتمر مالي دولي", category: "مالي" },
  { icon: "material-symbols:music-note", name: "مهرجان موسيقي دولي", category: "فني" },
  { icon: "material-symbols:palette", name: "معرض فني عالمي", category: "إبداعي" },
  { icon: "material-symbols:camera", name: "مهرجان سينمائي", category: "إعلامي" },
  { icon: "material-symbols:travel", name: "معرض السياحة", category: "سياحي" },
  { icon: "material-symbols:agriculture", name: "معرض الزراعة", category: "زراعي" },
  { icon: "material-symbols:energy-savings-leaf", name: "مؤتمر الطاقة المتجددة", category: "طبيعي" },
  { icon: "material-symbols:eco", name: "مؤتمر البيئة العالمي", category: "طبيعي" },
  { icon: "material-symbols:star-shine-rounded", name: "مناسبة دولية مهمة", category: "عام" },
  { icon: "material-symbols:gavel", name: "مؤتمر قانوني دولي", category: "قانون" },
  { icon: "material-symbols:library-books", name: "معرض الكتاب الدولي", category: "ثقافي" },
  { icon: "material-symbols:theater-comedy", name: "مهرجان مسرحي دولي", category: "ترفيهي" },
  { icon: "material-symbols:gamepad", name: "معرض الألعاب الإلكترونية", category: "ترفيه" },
  { icon: "material-symbols:local-hospital", name: "مؤتمر صحي دولي", category: "طبي" },
  { icon: "material-symbols:restaurant", name: "مهرجان الطعام العالمي", category: "غذائي" },
  { icon: "material-symbols:water-drop", name: "مؤتمر المياه العالمي", category: "طبيعي" },
  { icon: "material-symbols:flight", name: "مؤتمر الطيران المدني", category: "نقل" },
  { icon: "material-symbols:satellite-alt", name: "مؤتمر الأقمار الصناعية", category: "فضائي" },
  { icon: "material-symbols:security", name: "مؤتمر الأمن السيبراني", category: "تقني" },
  { icon: "material-symbols:smartphone", name: "معرض الهواتف الذكية", category: "تقني" },
  { icon: "material-symbols:engineering", name: "معرض الهندسة", category: "تقني" },
  { icon: "material-symbols:stadium", name: "استاد رياضي", category: "رياضي" },
  { icon: "material-symbols:festival", name: "مهرجان دولي", category: "مناسبات" },
  { icon: "material-symbols:star", name: "حدث مميز", category: "عام" },
  { icon: "material-symbols:flag", name: "مؤتمر وطني", category: "عام" },
  { icon: "material-symbols:event", name: "مناسبة رسمية", category: "مناسبات" },
  { icon: "material-symbols:handshake", name: "مؤتمر شراكات", category: "تجاري" },
  { icon: "material-symbols:lightbulb", name: "مؤتمر ابتكار", category: "تقني" },
  { icon: "material-symbols:shield", name: "مؤتمر أمني", category: "عسكري" }
];

// الفئات الافتراضية - فارغة للبداية
export const defaultCategories = [];

// الحصول على الفئات من localStorage
export const getEventCategories = () => {
  try {
    const stored = localStorage.getItem('eventCategories');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error loading event categories:', error);
  }
  return defaultCategories;
};

// حفظ الفئات في localStorage
export const saveEventCategories = (categories) => {
  try {
    localStorage.setItem('eventCategories', JSON.stringify(categories));
    return true;
  } catch (error) {
    console.error('Error saving event categories:', error);
    return false;
  }
};

// إضافة فئة جديدة
export const addEventCategory = (categoryData) => {
  const categories = getEventCategories();
  const newCategory = {
    id: `category_${Date.now()}`,
    name: categoryData.name,
    englishName: categoryData.englishName,
    icon: categoryData.icon,
    events: []
  };
  
  categories.push(newCategory);
  saveEventCategories(categories);
  return newCategory;
};

// إضافة حدث جديد لفئة معينة
export const addEventToCategory = (categoryId, eventData) => {
  const categories = getEventCategories();
  const category = categories.find(cat => cat.id === categoryId);
  
  if (category) {
    const newEvent = {
      id: `event_${Date.now()}`,
      name: eventData.name,
      date: new Date().toLocaleString(),
      delegationCount: 0,
      membersCount: 0
    };
    
    category.events.push(newEvent);
    saveEventCategories(categories);
    return newEvent;
  }
  
  return null;
};

// حذف فئة
export const deleteEventCategory = (categoryId) => {
  const categories = getEventCategories();
  const filtered = categories.filter(cat => cat.id !== categoryId);
  saveEventCategories(filtered);
  return filtered;
};

// حذف حدث من فئة
export const deleteEventFromCategory = (categoryId, eventId) => {
  const categories = getEventCategories();
  const category = categories.find(cat => cat.id === categoryId);
  
  if (category) {
    category.events = category.events.filter(event => event.id !== eventId);
    saveEventCategories(categories);
    return category.events;
  }
  
  return [];
};
