import { Router } from "express";
import { classMap } from '@durlabh/dframework/lib/business/business-base.mjs';
import businessConfig from "../business/business-object-config.js";
import path from "path";

const router = Router();

for (const businessConfigName in businessConfig) {
    // classMap.baseTypes={...classMap.baseTypes,...{"elastic":ElasticBusinessBase}}
    classMap.register(businessConfigName, businessConfig[businessConfigName]);
}

router.use("/:businessObjectName", (req, res, next) => {
    const businessObjectName = req.params.businessObjectName;
    const user = {
        scopeId: 1,
        id: 1
    }
    const constructor = classMap.get(businessObjectName);
    if (!constructor) {
        throw new Error(`Business object ${req.params.businessObjectName} not found`);
    }
    const businessObject = new constructor();
    businessObject.user = user;
    req.businessObject = businessObject;
    next();
});


router.post('/:businessObjectName/list', async (req, res) => {
    const { businessObject } = req;
    const { start, limit, sort, groupBy, include, exclude, where, filename, columns, lookups, logicalOperator, responseType, isElasticExport: isElastic, limitToSurveyed, fileName, fromSelfServe, userTimezoneOffset, selectedClients, isChildGrid } = req.body;

    if (fromSelfServe === "true" && businessObject.tableName == "MasterPlanogram") {
        const filePath = path.join(process.cwd(), `planogram.xlsx`);
        res.setHeader("Content-Disposition", `attachment; filename="Planogram Import.xlsx"`);
        return res.sendFile(filePath);

    }
    const data = await businessObject.fetchRecords({ start, limit, sort, filter: where, groupBy, include, exclude, columns: fromSelfServe === 'true' ? businessObject.importConfig.exportColumns : columns, logicalOperator, responseType, isElastic: Boolean(isElastic), limitToSurveyed, selectedClients, isChildGrid });

    if (filename) {
        res.attachment(filename);
    }
    return res.status(200).json(data);
});

router.get('/:businessObjectName/:id', async (req, res) => {
    const { businessObject } = req;
    const { id } = req.params;
    const { relations, lookups } = { ...req.query, ...req.body }

    const data = await businessObject.load({ id, relations });
    res.status(200).json({ success: true, data, lookups: await getLookups() });
});

router.put('/:businessObjectName/:id', async (req, res) => {
    const { businessObject } = req;
    const { id } = req.params;
    const { relations } = req.body;
    const data = await businessObject.saveRecord({ id, relations, ...req.body });
    res.status(200).json(data);
});

router.delete('/:businessObjectName/:id', async (req, res) => {
    const { businessObject } = req;
    const { id } = req.params;
    try {
        const data = await businessObject.deleteRecord({ id, ...req.body });
        res.status(200).json({ success: true, data, lookups: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message || 'An unexpected error occurred.' });
    }
});

export default router;