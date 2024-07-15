class FormulaSetting {
    constructor() {
        this.initialData = {
            "Id": "1",
            "Name": "态势展示方案",
            "ScenarioName": "航空态势展示",
            "Host": "https://localhost:7234/receiver",
            "EpochStartTime": null,
            "CentralBody": "Earth",
            "Parser": "spaceDataParser",
            "Description": "航空态势展示",
            "Settings": []
        };

        this.layerui = layui.use(['tree', 'layer'], function () {
            return { tree: layui.tree, layer: layui.layer };
        });

        let formData = this.initialData;

        let self = this;
        this.renderTree = () => {
            self.layerui.tree.render({
                elem: '#settings-tree',
                data: formData.Settings.map((setting, index) => ({
                    title: setting.Name || 'Unnamed Setting',
                    id: index,
                    children: [
                        { title: `WindowType: ${setting.WindowType}`, id: `${index}-windowtype` },
                        { title: `EntityId: ${setting.EntityId}`, id: `${index}-entityid` },
                        { title: `ReportName: ${setting.ReportName}`, id: `${index}-reportname` }
                    ]
                })),
                edit: ['add', 'update', 'del'],
                operate: function (obj) {
                    const type = obj.type;
                    const data = obj.data;
                    const id = data.id;

                    if (type === 'add') {
                        addSetting();
                    } else if (type === 'update') {
                        const newName = prompt('Enter new name:', data.title);
                        if (newName) {
                            updateSetting(id, 'Name', newName);
                        }
                    } else if (type === 'del') {
                        removeSetting(id);
                    }
                }
            });
        };
        this.addSetting = () => {
            formData.Settings.push({
                Name: '',
                WindowType: 'Report',
                EntityId: '',
                ReportName: '',
                Display: {
                    Box: {
                        Name: '',
                        Offset: [],
                        Area: [],
                        Class: ''
                    },
                    Content: {
                        Offset: [],
                        Area: [],
                        Class: ''
                    }
                }
            });
            renderTree();
        };
        this.removeSetting = (index) => {
            formData.Settings.splice(index, 1);
            renderTree();
        };

        this.updateSetting = (index, key, value) => {
            formData.Settings[index][key] = value;
            renderTree();
        };

        this.editSetting = (index) => {
            const setting = formData.Settings[index];
            const newWindowType = prompt('Enter WindowType:', setting.WindowType);
            const newEntityId = prompt('Enter EntityId:', setting.EntityId);
            const newReportName = prompt('Enter ReportName:', setting.ReportName);

            if (newWindowType) self.updateSetting(index, 'WindowType', newWindowType);
            if (newEntityId) self.updateSetting(index, 'EntityId', newEntityId);
            if (newReportName) self.updateSetting(index, 'ReportName', newReportName);
        };
    };
}