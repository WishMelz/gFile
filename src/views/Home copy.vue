<template>
    <div class="upload" v-loading.fullscreen.lock="fullscreenLoading">
        <a href="https://github.com/WishMelz/tFile">
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
        <!-- <button @click="createToken">createToken</button>
        <button @click="createFolder">createFolder</button>
        <button @click="init">init</button>
        <button @click="init">init</button> -->
        <button @click="init">init</button>
        <el-row style="padding: 0 30px; display: grid; place-items: center">
            <el-col :span="10" class="tokentip">
                <em>（不填Tokne则随机获取一个）</em>
            </el-col>
            <el-col :span="10">
                <el-input>
                    <template slot="append">
                        <el-button @click="setToken">SET</el-button>
                    </template>
                </el-input>
            </el-col>
        </el-row>
        <el-row style="padding: 0 30px; display: grid; place-items: center;margin-top: 80px">
            <el-col>
                <el-tag>token:{{ token }}</el-tag>
                <el-tag>folderId:{{ folder.id }}</el-tag>
                <el-tag>server:{{ server }}</el-tag>
                <!-- <el-tag>Token:e41470fc04603b777bc9185306ef828a</el-tag> -->
            </el-col>
            <el-col :span="10" class="resimg">
                <el-input v-model="fileUrl">
                    <template slot="prepend">fileUrl</template>
                    <template slot="append">
                        <el-button class="copy" @click="copy(fileUrl)">COPY</el-button>
                    </template>
                </el-input>
            </el-col>
            <!-- <el-col :span="10" class="resimg">
        <el-input v-model="resUrl.md">
          <template slot="prepend">Markdown</template>
          <template slot="append">
            <el-button class="copy" @click="copy(resUrl.md)">复制</el-button>
          </template>
        </el-input>
      </el-col> -->
            <!-- <el-col :span="10" style="text-align: center; padding: 20px">
        <img
          v-if="resUrl.type == 'image'"
          class="pic"
          :src="resUrl.url"
          alt=""
        />
        <video
          controls
          style="max-width: 100%"
          v-if="resUrl.type == 'video'"
          :src="resUrl.url"
        ></video>
      </el-col> -->
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
import jquery from 'jquery'
import { http } from '@/api/api'
import { upload, createAccount } from "@/api/upload"
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
        setToken() {
            if (this.token != '') {
                this.getAccountDetails()
            } else {
                this.createToken()
            }
        },
        async init() {
            // this.getContent()
            let data = {
                url: "https://api.gofile.io/createAccount",
            }
           let res = await http({...data},'获取Token失败!')
           console.log(res);
        },
        async createToken() {
            let _this = this
            this.fullscreenLoading = true
            jquery.ajax({
                url: "https://api.gofile.io/createAccount",
                success: res => {
                    console.log(res)
                    _this.token = res.data.token
                    _this.getAccountDetails()

                },
                error: err => {
                    this.$message.error("获取Token失败!")

                    console.log(err)
                }
            })
        },
        // 获取token详情
        getAccountDetails() {
            let _this = this
            jquery.ajax({
                url: "https://api.gofile.io/getAccountDetails?token=" + this.token,
                success: res => {
                    console.log(res)
                    _this.accountDetail = res.data
                    // _this.createFolder()
                    _this.fullscreenLoading = false
                },
                error: err => {
                    _this.fullscreenLoading = false
                    this.$message.error("获取token详情失败!")
                    console.log(err)
                }
            })
        },

        createFolder() {
            let _this = this
            let data = {
                token: this.token,
                parentFolderId: this.accountDetail.rootFolder
            }
            jquery.ajax({
                url: "https://api.gofile.io/createFolder",
                type: "PUT",
                data: data,
                success: res => {
                    console.log(res)
                    _this.folder = res.data
                    _this.setFolderOption()
                    // _this.accountDetail = res.data
                },
                error: err => {
                    this.$message.error("创建文件夹失败!")
                    console.log(err)
                }
            })
        },
        // 设置文件夹开放状态
        setFolderOption() {
            let data = {
                folderId: this.folder.id,
                token: this.token,
                option: 'public',
                value: true
            }
            let _this = this
            jquery.ajax({
                url: "https://api.gofile.io/setFolderOption",
                type: "PUT",
                data: data,
                success: res => {
                    _this.getServer()
                },
                error: err => {
                    this.$message.error("设置文件夹失败!")
                    console.log(err)
                }
            })
        },
        getServer() {
            let _this = this
            jquery.ajax({
                url: "https://api.gofile.io/getServer",
                success: res => {
                    console.log(res)
                    _this.server = res.data.server
                    _this.uploadFile()
                },
                error: err => {
                    _this.server = ''
                    this.$message.error("获取服务器失败!")
                    console.log(err)
                }
            })
        },
        // https://api.gofile.io/getServer
        uploadFile() {
            if (this.server == '') {
                return
            }
            let _this = this
            let formData = new FormData()
            formData.append("file", this.file)
            formData.append('folderId', this.folder.id)
            formData.append('token', this.token)
            jquery.ajax({
                url: `https://${_this.server}.gofile.io/uploadFile`,
                type: "POST",
                processData: false,
                contentType: false,
                cache: false,
                data: formData,
                success: res => {
                    console.log(res)
                    // _this.fileUrl = res
                    _this.file = null
                    _this.uploadData = res.data
                    _this.fullscreenLoading = false
                    this.$message.success("上传成功")
                    _this.getContent()
                },
                error: err => {
                    _this.file = null
                    this.$message.error("上传文件失败!")
                    _this.fullscreenLoading = false
                    console.log(err)
                }

            })
        },

        getContent() {
            let _this = this
            jquery.ajax({
                url: `https://api.gofile.io/getContent?token=${_this.token}&contentId=${_this.folder.id}&websiteToken=12345&cache=true`,
                success: res => {
                    console.log(res)
                    _this.contData = res.data
                    _this.fileUrl = res.data.contents[_this.uploadData.fileId].link
                },
                error: err => {
                    this.$message.error("获取Token失败!")
                    console.log(err)
                }
            })
        },
        async befUpload(file) {
            this.file = file
            this.fullscreenLoading = true
            this.createFolder()
        },
        // befUpload(file) {
        //     let fileType = file.type.split("/")[0]
        //     // 格式限制
        //     if (fileType == "image" || fileType == "video") {
        //     } else {
        //         this.$message.error("仅支持上传图片和视频!")
        //         return
        //     }

        //     this.resUrl.type = fileType
        //     this.uploadFile(file)
        // },
        // uploadFile(file) {
        //     let formData = new FormData()
        //     formData.append("file", file)
        //     this.fullscreenLoading = true
        //     upload(formData)
        //         .then((res) => {
        //             this.fullscreenLoading = false
        //             if (res.error) {
        //                 this.$message.error(res.error)
        //                 return
        //             }
        //             this.resUrl.url = `https://telegra.ph${res[0].src}`
        //             this.resUrl.md = `![wishtfile](https://telegra.ph${res[0].src})`
        //             this.$message.success("上传成功")
        //         })
        //         .catch((err) => {
        //             console.log(err)
        //             this.fullscreenLoading = false
        //         })
        // },
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
