// Srvanaserviceplatform/src/components/common/GovernorateSelect.jsx
import React from 'react';

const governorates = [
    "الإسكندرية", "الإسماعيلية", "الأقصر", "البحر الأحمر", "البحيرة", "الجيزة",
    "الدقهلية", "السويس", "الشرقية", "الغربية", "الفيوم", "القاهرة", "القليوبية",
    "المنوفية", "المنيا", "الوادي الجديد", "بني سويف", "بورسعيد", "جنوب سيناء",
    "دمياط", "سوهاج", "شمال سيناء", "قنا", "كفر الشيخ", "مطروح", "أسوان", "أسيوط"
];

const GovernorateSelect = ({ value, onChange, ...props }) => {
    return (
        <select value={value} onChange={onChange} {...props}>
            <option value="">اختر المحافظة</option>
            {governorates.map((governorate) => (
                <option key={governorate} value={governorate}>
                    {governorate}
                </option>
            ))}
        </select>
    );
};

export default GovernorateSelect;