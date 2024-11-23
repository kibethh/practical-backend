const businessConfig = {
    SecurityUser: {
        tableName: "SecurityUser",
        defaultSortOrder: "FirstName ASC",
        selectStatement: "SELECT * FROM SecurityUser Main",
        readOnlyColumns: ["ModifiedByUser"],
        clientBased: false,
        useView: false
    }
}

export default businessConfig;