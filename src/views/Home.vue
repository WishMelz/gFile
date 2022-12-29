<template>
    <div class="upload" v-loading.fullscreen.lock="fullscreenLoading">
        <a href="https://github.com/WishMelz/gFile">
            <img style="
                position: fixed;
                top: 0px;
                right: 0px;
                border: 0px;
                width: 150px;
        " src="https://cdn.jsdelivr.net/gh/WishMelz/file@master/messy/614b81962449bb3430193bdd6eaa3c7f.png" alt="Fork me on GitHub" />
        </a>
        <el-row style="text-align: center">
            <el-col>
                <el-upload style="width: 100%" class="upload-demo" drag multiple action="/" :before-upload="befUpload">
                    <i class="el-icon-upload"></i>
                    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
                    <div class="el-upload__text"><b>支持 ctrl + v 上传</b></div>
                </el-upload>
            </el-col>
        </el-row>
        <el-divider></el-divider>
        <div style="text-align: center; padding-bottom: 20px; font-size: 14px">
            支持任意文件！！！
        </div>
        <el-row style="padding: 0 30px; display: grid; place-items: center">
            <el-col :span="10" class="tokentip">
                <!-- <em>（不填Tokne则随机获取一个）</em> -->
            </el-col>
            <el-col :span="10">
                <el-input v-model="token">
                    <template slot="append">
                        <el-button @click="setToken">SET</el-button>
                    </template>
                </el-input>
            </el-col>
        </el-row>
        <el-row style="padding: 0 30px; display: grid; place-items: center;margin-top: 80px">
            <el-col style="text-align: center;">
                <el-tag v-if="folder.id" style="margin: 10px 0">FolderId:{{ folder.id }}</el-tag> <br>
                <el-tag v-if="server" type="success" style="margin: 10px 0">Server:{{ server }}</el-tag>
            </el-col>
            <el-col :span="10" class="resimg">
                <el-input v-model="fileUrl">
                    <template slot="prepend">fileUrl</template>
                    <template slot="append">
                        <el-button class="copy" @click="copy(fileUrl)">COPY</el-button>
                    </template>
                </el-input>
            </el-col>
        </el-row>
        <footer>
            <span>
                <a href="https://github.com/WishMelz/imgurl">Github图片管理系统</a>
            </span>
            |
            <span>
                <a href="https://github.com/WishMelz/tFile">TG视频/图片床</a>
            </span>
        </footer>
    </div>
</template>

<script>
import { http } from '@/api/api'
export default {
    data() {
        return {
            resUrl: {
                url: "",
                type: "",
                md: "",
            },
            fullscreenLoading: false,

            token: '',
            accountDetail: {},
            folder: {},
            server: "",
            file: null,
            fileUrl: "",
            uploadData: {},
            contData: {}
        }
    },
    mounted() {
        let _this = this
        document.addEventListener("paste", function (event) {
            var isChrome = false
            if (event.clipboardData || event.originalEvent) {
                //某些chrome版本使用的是event.originalEvent
                var clipboardData =
                    event.clipboardData || event.originalEvent.clipboardData
                if (clipboardData.items) {
                    // for chrome
                    var items = clipboardData.items,
                        len = items.length,
                        blob = null
                    isChrome = true
                    for (var i = 0; i < len; i++) {
                        if (items[i].type.indexOf("image") !== -1) {
                            //getAsFile() 此方法只是living standard firefox ie11 并不支持
                            blob = items[i].getAsFile()
                        }
                    }
                    if (blob !== null) {
                        if (_this.fullscreenLoading) {
                            return
                        }
                        _this.befUpload(blob)

                        //base64码显示
                        // reader.onload = function (event) {
                        //   // event.target.result 即为图片的Base64编码字符串
                        //   var base64_str = event.target.result;
                        // };
                    }
                }
            }
        })
    },
    methods: {
        async setToken() {
            this.fullscreenLoading = true
            await this.createToken()
            await this.getAccountDetails()
            this.fullscreenLoading = false
        },
        async createToken() {
            let serveData = {
                url: "https://api.gofile.io/createAccount"
            }
            let res = await http(serveData, "获取Token失败!")

            if (res.status == 'ok') {
                this.token = res.data.token
            }
        },
        // 获取token详情
        async getAccountDetails() {
            let serveData = {
                url: "https://api.gofile.io/getAccountDetails?token=" + this.token
            }
            let res = await http(serveData, "获取token详情失败!")

            if (res.status == 'ok') {
                this.accountDetail = res.data
            }
        },
        // 创建文件夹
        async createFolder() {
            let serveData = {
                url: "https://api.gofile.io/createFolder",
                type: "PUT",
                data: {
                    token: this.token,
                    parentFolderId: this.accountDetail.rootFolder
                }
            }
            let res = await http(serveData, "创建文件夹失败!")

            if (res.status == 'ok') {
                this.folder = res.data
            }
        },
        // 设置文件夹开放状态
        async setFolderOption() {
            let serveData = {
                url: "https://api.gofile.io/setFolderOption",
                type: "PUT",
                data: {
                    folderId: this.folder.id,
                    token: this.token,
                    option: 'public',
                    value: true
                }
            }
            let res = await http(serveData, "设置文件夹失败!")
            // this.folder = res.data

        },
        // 获取可以服务
        async getServer() {
            let serveData = {
                url: "https://api.gofile.io/getServer",
            }
            let res = await http(serveData, "获取服务器失败!")
            if (res.status == 'ok') {
                this.server = res.data.server
            }
        },

        // 上传文件
        async uploadFile() {
            if (this.server == '') {
                return
            }
            let formData = new FormData()
            formData.append("file", this.file)
            formData.append('folderId', this.folder.id)
            formData.append('token', this.token)


            let serveData = {
                url: `https://${this.server}.gofile.io/uploadFile`,
                type: "POST",
                processData: false,
                contentType: false,
                cache: false,
                data: formData,
            }
            let res = await http(serveData, "上传文件失败!")
            this.file = null
            if (res.status == 'ok') {
                this.uploadData = res.data
            }
        },
        // 获取详情
        async getContent() {
            let serveData = {
                url: `https://api.gofile.io/getContent?token=${this.token}&contentId=${this.folder.id}&websiteToken=12345&cache=true`,
            }
            let res = await http(serveData, '获取上传详情失败！')
            if (res.status == 'ok') {
                this.contData = res.data
                this.fileUrl = res.data.contents[this.uploadData.fileId].link
            }
        },
        async befUpload(file) {
            this.file = file
            this.fullscreenLoading = true
            if (this.token == '') {
                this.$message.error('请设置Token')
                return
            }
            await this.createFolder()
            await this.setFolderOption()
            await this.getServer()
            await this.uploadFile()
            await this.getContent()
            this.fullscreenLoading = false
        },

        // 复制内容
        copy(val) {
            if (val == "" || !val) {
                return
            }
            let oInput = document.createElement("input")
            oInput.value = val
            document.body.appendChild(oInput)
            oInput.select()
            document.execCommand("Copy")
            this.$message({
                message: "复制成功",
                type: "success",
            })
            oInput.remove()
        },
    },
}
</script>

<style scoped>
.upload {
    /* margin-top: 60px; */
    padding-top: 60px;
    min-height: 100vh;
    box-sizing: border-box;
}

.pic {
    max-width: 100%;
}

footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    color: #c0c4cc;
}

footer a {
    list-style: none;
    text-decoration: none;
    color: #909399;
}

.tokentip {
    font-size: 12px;
    text-align: right;
}
</style>
