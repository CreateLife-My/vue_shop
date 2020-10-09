<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 按钮区 -->
      <el-row class="btn">
        <el-col>
          <el-button type="primary" @click="addRolesDialog = true" >添加角色</el-button>
        </el-col>
      </el-row>

      <el-card>
        <el-table :data="rolelist" border stripe>
          <!-- 展开列 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-row v-for="(item1 , i1 ) in scope.row.children" :key="item1.id"
                  :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
                >
                  <!-- 渲染一级 -->
                  <el-col :span="5" >
                    <el-tag  closable @close="removeRightById(scope.row , item1.id)" > {{item1.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 渲染二级 -->
                  <el-col :span="19">
                    <el-row v-for="(item2, i2) in item1.children" :key="item2.id"
                      :class="[i2 === 0 ? '' : 'bdtop' ,'vcenter']" 
                    >
                      <el-col :span="6">
                        <el-tag type="success"  closable @close="removeRightById(scope.row , item2.id)">{{item2.authName}}</el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                      <el-col :span="18">
                        <el-tag  type="warning" v-for="(item3) in item2.children " :key="item3.id" 
                         closable @close="removeRightById(scope.row , item3.id)"
                        >
                          {{item3.authName}}
                        </el-tag>
                        <i class="el-icon-caret-right"></i>
                      </el-col>
                    </el-row>
                  </el-col>
                </el-row>

              </template>
            </el-table-column>

          <!-- 索引列 -->
          <el-table-column type="index"></el-table-column>
          <el-table-column label="角色名称" prop="roleName"></el-table-column>
          <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
          <el-table-column label="操作" width="300px">
            <template slot-scope="scope" >
              <el-button size="mini" type="primary" icon="el-icon-edit"
                @click="showREditDialog(scope.row.id)"
                >编辑</el-button
              >
              <el-button size="mini" type="danger" icon="el-icon-delete"
                @click="romoveUserRolesByid(scope.row.id)"
                >删除</el-button
              >
              <el-button size="mini" type="warning" icon="el-icon-setting" 
                @click="showSetRigthDialog(scope.row)"
                >分派权限</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-card>
    </el-card>

    <!-- 添加角色对话框 -->
    <el-dialog title="提示" :visible.sync="addRolesDialog" width="50%"  @close="addRDialogClosed">
      <el-form :model="addRolesForm"  ref="addRolesRef" label-width="70px" class="demo-ruleForm">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRolesForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRolesForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialog = false">取   消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色对话框 -->
    <el-dialog  title="修改角色" :visible.sync="editDialogRoles"  width="50%" >
      <el-form ref="editRolesRef"  :model="editRolesForm" label-width="70px">
        <el-form-item label="角色名称">
          <el-input v-model="editRolesForm.roleName" ></el-input>
        </el-form-item>
        <el-form-item label="角色描述" >
          <el-input v-model="editRolesForm.roleDesc" ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogRoles = false">取 消</el-button>
        <el-button type="primary" @click="editRolesInfo">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色管理对话框 -->
    <el-dialog title="提示"  :visible.sync="setRolesDialogVisible" width="50%" 
      @close="setRigthDialogClosed">
      <el-tree ref="treeRef" :data="rightslist" :props="treeProps" show-checkbox
        node-key="id" default-expand-all :default-checked-keys="defkeys"
      ></el-tree>

    <span slot="footer" class="dialog-footer">
      <el-button @click="setRolesDialogVisible = false">取 消</el-button>
      <el-button type="primary" @click="allotRights">确 定</el-button>
    </span>
  </el-dialog>
    
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所有角色列表
      rolelist: [],
      addRolesDialog: false,
      addRolesForm: {
        roleName: '',
        roleDesc: ''
      },
      // 修改
      editRolesForm:{},
      editDialogRoles: false,
      setRolesDialogVisible: false,
      // 所有权限的数值
      rightslist:[],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认勾选的节点的 key 的数组
      defkeys:[],
      // 当前即将分配权限的id
      roleId: '',
    }
  },

  methods: {
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolelist = res.data
      // console.log(res.data)
    },

    // 关闭弹框
    addRDialogClosed() {
      this.$refs.addRolesRef.resetFields()
    },

    // 添加角色
    addRoles() {
      this.$refs.addRolesRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.post('roles', this.addRolesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加角色成功')
        this.addDialogVisble = false
        this.getRolesList()
      })
    },

    async showREditDialog(id) {
      const {data:res} = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败')
      }
      this.editRolesForm = res.data
      this.editDialogRoles = true
    },

    editRolesInfo() {
      this.$refs.editRolesRef.validate(async valid => {
        if(!valid) return
        const {data:res} = await this.$http.put('roles/' + this.editRolesForm.roleId ,
        {roleName:this.editRolesForm.roleName , roleDesc:this.editRolesForm.roleDesc })
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.editDialogRoles = false
        this.getRolesList()
        this.$message.success('修改角色成功')
      })
    },

    async romoveUserRolesByid(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if(confirmResult  !== 'confirm'){
        return this.$message.info('已经取消用户删去')
      }

      const {data :res} = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户角色失败')
      }
      this.$message.success('删除用户角色成功')

      this.getRolesList()
    },


    // 根据id删除对象的权限
    async removeRightById(role , rightId) {
       const confirmResult = await this.$confirm('此操作将永久删除该用户权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if(confirmResult  !== 'confirm'){
        return this.$message.info('已经取消用户删去')
      }
      const {data :res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户权限失败')
      }
      // this.getRolesList()
      //无需再重新加载所有权限
      //只需要对现有的角色权限进行更新即可
      role.children = res.data
    },

    async showSetRigthDialog(role) {
      this.roleId = role.id
      // 获取所有权限的数据
      const {data:res} = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户权限失败')
      }
      // console.log(res.data);
      this.rightslist = res.data

      // 递归获取三级节点的ID
      // this.getLeafKeys(role, this.defKeys)
      this.getLeafKeys(role, this.defkeys)
      this.setRolesDialogVisible = true
    },

    // 通过递归的形式，获取截取下所有三级权限的id，并保存到defkeys 组中
    getLeafKeys(node, arr) {
      // 如果node 节点不包含children 属性，则是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => 
        this.getLeafKeys(item, arr))
    },

    // 关闭时刷新数组
    setRigthDialogClosed() {
      this.defkeys = []
    },

    // 点击分配权限 
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys(),
      ]
      // console.log(keys);
      const idStr = keys.join(',')

      const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`,{rids:idStr})
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRolesList()
      this.setRolesDialogVisible = false
    }

  },

  created() {
    this.getRolesList()
  }
}
</script>

<style lang="less" scope>
.btn{
  margin-bottom: 20px;
}

.el-tag{
  margin: 7px;
}

.bdtop{
  border-top: 1px solid #eee;
}

.bdbottom{
  border-bottom: 1px solid #eee;
}

.vcenter{
  display: flex;
  align-items: center;
}
</style>
