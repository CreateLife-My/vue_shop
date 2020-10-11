<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false" > </el-alert>

      <!-- 步骤 -->
      <el-steps :span="200" :active="activeIndex - 0 " finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px" 
      class="demo-ruleForm" label-position="top">
        <el-tabs :tab-position="'left'"  v-model="activeIndex" :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
             <el-cascader v-model="addForm.goods_cat" :options="catelist" @change="handleChange"
              expand-trigger="hover"  :props="cateProps"
             ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单Item -->
            <el-form-item :label="item.attr_name" v-for="item in manyTabDate" :key="item.attr_id">
               <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox border :label="cb" v-for="(cb, i) in item.attr_vals" :key="i"></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for=" item in onlyTabDate" :key="item.attr_id">
              <el-input v-model="item.attr_vals" ></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action:表示图片要上传的API地址 -->
            <el-upload 
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview" :headers="headerObj" 
              :on-remove="handleRemove" :on-success="handleSuccess"
              list-type="picture">
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!--富文本编辑器组件 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="add" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

  <!-- 图片预览 -->
    <el-dialog
      title="图片预览" :visible.sync="previewVisible" width="50%" >
      <img :src="previewPath" alt="" class="preview">
    </el-dialog>
  </div>
</template>

<script>

import _ from 'lodash'

export default {
  components: {},
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_weight: '0',
        goods_number: '0',
        goods_cat: [],
        // 图片的数组 
        pics: [],
        goods_introduce: '',
        attrs:[]
      },
      addFormRules:{
        goods_name: [ { required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [ { required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_weight: [ { required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_number: [ { required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_cat: [ { required: true, message: '请输入商品分类', trigger: 'blur' }],
      },
      catelist:[],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
      },
      // 动态参数列表数据
      manyTabDate: [],
      onlyTabDate: [],
      // 图片上传的heards请求对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览路劲
      previewPath:'',
      previewVisible: false
    }
  },
  computed: {
    cateId() {
      if(this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    } 
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      this.catelist = res.data
      console.log(this.catelist)
    },
    // 级联选择器触发函数
    handleChange() {
      // console.log(this.addForm.goods_cat);
      if(this.addForm.goods_cat.length !== 3){
        this.addForm.goods_cat = ''
      }
    },

    // 切换标签之前的钩子，若返回 false 或者返回 Promise 且被 reject，则阻止切换。
    beforeTabLeave(activeName, oldActiveName) {
      if(oldActiveName === '0' && this.addForm.goods_cat.length !== 3){
        this.$message.error('请选者商品分类')
        return false
      }
    },

    async tabClicked() {
      // console.log(this.activeIndex);
      // 证明访问的1号面板
      if(this.activeIndex === '1') {
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes` ,
        {params : {sel : 'many'}})  

        if (res.meta.status !== 200) {
        return this.$message.error('获取信息失败')
        }
        // this.$message.success('获取信息成功')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTabDate = res.data
        console.log(this.manyTabDate);
      }else if(this.activeIndex === '2'){
        const {data:res} = await this.$http.get(`categories/${this.cateId}/attributes` ,
          {params : {sel : 'only'}})  
        if (res.meta.status !== 200) {
          return this.$message.error('获取信息失败')
        }
        this.onlyTabDate = res.data
        console.log(this.onlyTabDate);
      }

    },

    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1获取将要删去图片你的临时路径
      const filePath = file.response.data.tmp_path
      // 2、从pics 数组中。找到这和图片对应索引值
      const i = this.addForm.pics.findIndex(x => 
      x.pic === filePath)
      // 3、 调用数组的splice 方法 把这个图片对象的索引值移除
      this.addForm.pics.splice(i,1)
      console.log(this.addForm);
    },
    // 监听图片上传成功的时间
    handleSuccess(response) {
      //1、 先拼接得到一个图片信息对象
      const picInfo = {pic: response.data.tmp_path}
      // 2、 将图片信息对象 push到pics数组中
      this.addForm.pics.push(picInfo)
      console.log(this.addForm);
    },

    add() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid)  {
          return this.$message.error('请填写必要的表单项')
        }
        // 执行添加的业务逻辑
        // lodash  cloneDeep(obj)
        const form = _.cloneDeep( this.addForm)
        form.goods_cat = form.goods_cat.join(',')

        // 处理动态参数 
        this.manyTabDate.forEach(item => {
          const newInfo ={
            attr_id :item.attr_id,
            attr_value :item.attr_vals.join(' ')
          }
          this.addForm.attrs.push(newInfo)
        })

        // 静态属性
        this.manyTabDate.forEach(item => {
          const newInfo ={
            attr_id :item.attr_id,
            attr_value :item.attr_vals
          }
          this.addForm.attrs.push(newInfo)
        })
        
        form.attrs = this.addForm.attrs
        console.log(form);

        // 法请添加商品
        const { data: res } = await this.$http.post('goods', form)
          if (res.meta.status !== 201) {
            return this.$message.error('添加商品失败')
          }
          this.$message.success('添加商品成功')
          this.$router.push('/goods')
      })
    }
  },
  created() {
    this.getCateList() 
  }
}
</script>

<style scoped lang="less">
.el-checkbox {
  margin: 0 10px 0 0 !important ;
}
.preview{
  width: 100%;
}
.add {
  margin-top: 15px;
}
</style>
