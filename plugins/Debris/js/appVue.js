


var vueThis = new Vue({
    el: '#app',
    data: function () {
        return {
            visible: false,
            msg: '123213123',
            activeName: 'first',
            tableData: [],
            tableData2: [],
            total: 0,
            select: '名称',
            keyword: '',
            pagesize: 10,
            currentPage: 1,
            disabled: false
        }
    },

    methods: {
        handleSwitchTab(tab, event) {
            console.log(tab)
            switch (tab.index) {
                case '0':
                    for (var [key, value] of Debris.getInstance()._debrisMap) {
                        value.visible = true
                    }
                    break
                case '1':
                    // 只显示轨道的碎片
                    for (var [key, value] of Debris.getInstance()._debrisMap) {
                        value.visible = Debris.getInstance()._orbits.has(key) ? true : false
                    }
                    break
            }
        },
        handleSizeChange(val) {
            console.log(val);
            this.pagesize = val

            if (this.keyword.trim() === '') {
                let values = Debris.getInstance()._debrisMap.values()
                let data = Array.from(values, (n) => n._satrec)
                this.fillSearchTable(data, false)
            } else {
                this.fillSearchTable(this.tableData, true)
            }
        },
        handleCurrentChange(val) {
            console.log(val);
            let values = Debris.getInstance()._debrisMap.values()
            let data = Array.from(values, (n) => n._satrec).slice((val - 1) * this.pagesize, val * this.pagesize)
            this.fillSearchTable(data, false)
        },
        fillSearchTable(data, updateTotal) {
            this.tableData = data.length < this.pagesize ? data : data.slice(0, this.pagesize)
            // console.log(this.tableData);
            if (updateTotal) this.total = data.length
        },
        handleSearchCheckChange(value, row) {
            row.showOrbit = value
            if (value) {
                this.tableData2.push(row)
                Debris.getInstance().addOrbit(row.satnum)
            } else {
                let index = this.tableData2.findIndex((v) => v.satnum === row.satnum)
                this.tableData2.splice(index, 1)
                Debris.getInstance().removeOrbit(row.satnum)
            }
        },
        handleDelete(index, row) {
            // 删除绑定的数据
            this.tableData2.splice(index, 1)

            // 更新 "+", "-"
            let obj = this.tableData.find((n) => n.satnum === row.satnum)
            if (obj) obj.showOrbit = false

            Debris.getInstance().removeOrbit(row.satnum)
            Debris.getInstance().getDebris(row.satnum).visible = false
        },
        handleCheckChange(value, row) {
            // console.log(value, row)
            Debris.getInstance().getDebris(row.satnum)._orbit.visible = value
        },
        handleUnSelectAll() {
            for (const data of this.tableData2) {
                // 更新tableData的状态值
                let obj = this.tableData.find((v) => v.satnum === data.satnum)
                if (obj) obj.showOrbit = false
                Debris.getInstance().removeOrbit(data.satnum)
                Debris.getInstance().getDebris(data.satnum).visible = false
            }
            this.tableData2 = []
        },
        handleSelectAll() {
            for (const data of this.tableData) {
                if (!data.showOrbit) {
                    data.showOrbit = true
                    this.tableData2.push(data)
                }
                Debris.getInstance().addOrbit(data.satnum)
            }
        },
        handerSearchButtonClick() {
            if (this.keyword.trim() === '') return
            this.disabled = true

            let values = Debris.getInstance()._debrisMap.values()
            let data = []
            switch (this.select) {
                case 'ID':
                    data = Array.from(values, (n) => n._satrec).filter((x) => x.satnum.includes(this.keyword.toUpperCase()))
                    break
                case '名称':
                    data = Array.from(values, (n) => n._satrec).filter((x) => x.name.includes(this.keyword.toUpperCase()))
                    break
                case '国际代码':
                    data = Array.from(values, (n) => n._satrec).filter((x) => x.intldes.includes(this.keyword.toUpperCase()))
                    break
                case '所属国':
                    data = Array.from(values, (n) => n._satrec).filter((x) => x.owner.includes(this.keyword.toUpperCase()))
                    break
                case '类型':
                    data = Array.from(values, (n) => n._satrec).filter((x) => x.type.includes(this.keyword.toUpperCase()))
                    break
            }
            this.fillSearchTable(data, true)

            // 更新球
            let satnums = data.map((x) => {
                return x.satnum
            })

            for (var [key, value] of Debris.getInstance()._debrisMap) {
                value.visible = satnums.includes(key)
            }
        },
        handleSearchClear() {
            this.disabled = false
            let values = Debris.getInstance()._debrisMap.values()
            let data = Array.from(values, (n) => n._satrec)
            this.fillSearchTable(data, true)

            // 更新球
            for (var [key, value] of Debris.getInstance()._debrisMap) {
                value.visible = true
            }
        },
    }

})