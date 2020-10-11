<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视区 -->
    <el-card>
      <el-alert show-icon title=" 注意：只允许第三级分类设置相关参数" type="warning" :closable="false"></el-alert>

      <!-- 商品分类 -->
      <el-row class="cat_row">
        <el-col>
          <span>选中商品分类:</span>
          <!-- 级联选择器 -->
          <el-cascader v-model="selectedCateKeys" :options="catelist" expand-trigger="hover" :props="cateProps"
          @change="handleChange" size="small"
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tabs页签 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
           >添加参数</el-button>
          <!-- 动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开航 -->
            <el-table-column type="expand">
               <template  slot-scope="scope"  >
                <!-- 循环渲染tag -->
                <el-tag v-for="(item ,i) in scope.row.attr_vals" :key="i" closable
                  @close="handleClose(i , scope.row)">{{item}}
                </el-tag>
                <!-- 添加文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue "
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" 
                  @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>

            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name" ></el-table-column>
            <el-table-column label="操作">
              <template  slot-scope="scope"  >
                <el-button size="mini" type="primary" icon="el-icon-edit"
                  @click="showParamsDialogVisible(scope.row.cat_id)"
                >编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加参数</el-button>
          <!-- 静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开航 -->
            <el-table-column type="expand">
               <template  slot-scope="scope"  >
                <!-- 循环渲染tag -->
                <el-tag v-for="(item ,i) in scope.row.attr_vals" :key="i" closable
                  @close="handleClose(i , scope.row)">{{item}}
                </el-tag>
                <!-- 添加文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue "
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                >
                </el-input>
                <el-button v-else class="button-new-tag" size="small" 
                  @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>  
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name" ></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope" >
                <el-button size="mini" type="primary" icon="el-icon-edit"
                  @click="showParamsDialogVisible(scope.row.attr_id)"
                >编辑</el-button>
                <el-button size="mini" type="danger" icon="el-icon-delete"
                  @click="removeParamsById(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addDialogVisible" width="40%" @close="addDialogClosed" >
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false" >取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数对话框 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="editDialogParams" width="40%" @close="editDialogClosed" >
      <el-form :model="editParamsForm" ref="editParamsRef" label-width="100px" >
        <el-form-item :label="titleText" >
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogParams = false" >取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>


<script>


export default {
  data() {
    return {
      catelist:[],
      // 级联对象的配置属性
      cateProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联双向绑定的数据值
      selectedCateKeys:{},
      // 被激活的页签名称
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      addDialogVisible: false,
      addForm: {
        attr_name: ''
      },
      addFormRules: {
        attr_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      },
      editDialogParams: false,
      editParamsForm: {},
      editFormRules: {
        attr_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      },
      
    };
  },

  created() {
    this.getCateList()
  },

  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data
      console.log(this.catelist)
    },

    handleChange() {
      this.getParamsData()
    },

    // tab 点击数据的处理函数
    handleTabClick() {
      this.getParamsData()
      // console.log(this.onlyTableData);
      // console.log(this.manyTableData);
    },

    // 获取参数的列表数据
    async getParamsData() {
      if(this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      // 根据所选分类的ID，和当前所处的面板，获取对应的参数
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes`
      , {params:{ sel: this.activeName}})
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表失败')
      } 

      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ?
        item.attr_vals.split(' ') : []
        // 控制文本框的显示与隐藏
        // 为每一个item 提供单独的VisIble
        item.inputVisible = false
        item.inputValue = ''
      })  
      console.log(res.data);


      if(this.activeName === 'many') {
        this.manyTableData = res.data
      }else {
        this.onlyTableData = res.data
      }
    },

    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },

    addParams() {
      this.$refs.addFormRef.validate(async vali => {
        if(!vali) return
        const {data:res} = await this.$http.post(`categories/${this.cateId}/attributes`, 
          {attr_name: this.addForm.attr_name, attr_sel:this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        } 
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getParamsData()
      })
    },


    async showParamsDialogVisible(id) {
      const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes/${id}`,{
        params:{ attr_sel:this.activeName}
      })
      if (res.meta.status !== 200) {
        return this.$message.error('查询分类失败')
      }
      this.editParamsForm = res.data
      console.log(this.editParamsForm);
      this.editDialogParams = true
      console.log(id);
    },

    editDialogClosed() {
       this.$refs.editParamsRef.resetFields()
    },

    editParams() {
       this.$refs.editParamsRef.validate(async vali => {
        if(!vali) return
        const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`, 
          {attr_name: this.editParamsForm.attr_name, attr_sel:this.activeName })
        if (res.meta.status !== 200) {
          return this.$message.error('添加参数失败')
        } 
        this.$message.success('添加参数成功')
        this.editDialogParams = false
        this.getParamsData()
      })
    },

    async removeParamsById(attr_id) {
      // console.log(123);
      const confirmResult = await this.$confirm('此操作将永久删除参数信息, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if(confirmResult  !== 'confirm'){
        return this.$message.info('已经取消')
      }

      const {data :res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数信息失败')
      }
      this.$message.success('删除参数信息成功')

      this.getParamsData()
    },

    // 文本框视区焦点或按下enter触发
    async handleInputConfirm(row) {
      if(row.inputValue.trim().length ===0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 如果没有return，则证明输入的内容，需要做一些后续处理
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 点击按钮显示
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获取焦点
      // nextTick: 方法的作用 当页面上的元素被重新渲染之后，才会指定回调函数中的代码
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },

    // 将对 attr_vals 的操作保存到数据库
    async saveAttrVals(row) {
      const {data:res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`,{
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' '),
      })
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数信息失败')
      }
      this.$message.success('添加参数信息成功')
    },

    // 删去按钮
    handleClose(i ,row) {
      row.attr_vals.splice(i , 1)
      this.saveAttrVals(row)
    }

    
  },


  computed: {
    // 如果按钮被禁用 则赶回true 否者返回false
    isBtnDisabled() {
      if(this.selectedCateKeys.length !== 3){
        return true
      }
      return false
    },

    // 当前选中的三级分类ID
    cateId() {
      if(this.selectedCateKeys.length == 3) {
        return this.selectedCateKeys[2]
      }
      return null
    },

    // 动态计算标题的文本
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
  
}

</script>

<style scoped lang="less">
.cat_row{
  margin: 15px 0 ; 
}

.el-cascader{
  margin-left: 10px;
}
.input-new-tag{
  width: 120px;
}

</style>