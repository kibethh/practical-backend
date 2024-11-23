import { default as Framework, mssql, logger, appConfig, BusinessBase, ElasticBusinessBase } from '@durlabh/dframework';
const instance = new Framework({ clientOptions: { https: appConfig.httpsOptions } });

instance.logger = logger;
BusinessBase.businessObject = instance;

export default instance;

export {
    instance as DFramework,
    mssql,
    logger,
    appConfig as config,
    BusinessBase as FrameworkBusinessBase,
    ElasticBusinessBase as FrameworkElasticBase
}