import { useState } from "react";
import { useTranslation } from 'react-i18next';
import FormSection from "./FormSection";
import { MaterialCard } from "./MaterialCard";
import { HazardousMaterialsPreamble } from "./HazardousMaterialsPreamble";
import { useMaterials } from "../helpers/MaterialsContext";
import { CommonChemical } from "./CommonHazmatCards";
import { Unit } from "../helpers/FeeProcessor";

export function HazardousMaterials({ show = true }: { show?: boolean }) {
    const { t } = useTranslation();
    const { materials, setMaterials } = useMaterials();
    const [collapsedMaterials, setCollapsedMaterials] = useState<boolean[]>([false]);

    const appendMaterial = (material: CommonChemical) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { minimumReportableAmount, name, label, ...mat } = material;

        setMaterials([...materials, { id: Date.now(), ...{ name: label, ...mat } }]);
        setCollapsedMaterials(Array(collapsedMaterials.length).fill(true).concat(false));
    }

    const addMaterial = () => {
        const newMaterial = { id: Date.now(), unit: 'gallons' as Unit, health_hazard: '0', fire_hazard: '0', instability_hazard: '0', quantity: '0' };
        setMaterials([...materials, newMaterial]);
        setCollapsedMaterials(Array(collapsedMaterials.length).fill(true).concat(false));
    };

    const removeMaterial = (id: number) => {
        setMaterials(materials.filter(material => material.id !== id));
        setCollapsedMaterials(collapsedMaterials.filter((_, i) => i !== materials.findIndex(material => material.id === id)));
    };

    const toggleCollapseState = (index: number) => {
        setCollapsedMaterials(collapsedMaterials.map((isCollapsed, i) => i === index ? !isCollapsed : isCollapsed));
    };

    if (!show) return null;

    return (
        <FormSection title={t('hazardous_materials.title')}>
            <HazardousMaterialsPreamble appendMaterial={appendMaterial} />
            <h3>{t('hazardous_materials.list_title')}</h3>
            {materials.map((material, index) => (
                <div key={material.id}>
                    <MaterialCard setMaterials={setMaterials} toggleCollapseState={() => toggleCollapseState(index)} isCollapsed={collapsedMaterials[index]} material={material} index={index} removeMaterial={removeMaterial} />
                </div>
            ))}
            <button type="button" className="btn btn-primary pulse mb-3" onClick={addMaterial}>{t('hazardous_materials.add_material')}</button>
        </FormSection>
    );
}
