# 邮箱验证配置指南

## 支持的邮箱服务商

我们的系统现在支持以下主流邮箱服务商：

### 1. Gmail (Google)
- **域名**: gmail.com
- **配置**: 使用 Gmail 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@gmail.com
  EMAIL_APP_PASSWORD=your-gmail-app-password
  ```

### 2. Outlook/Hotmail (Microsoft)
- **域名**: outlook.com, hotmail.com, live.com
- **配置**: 使用 Microsoft 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@outlook.com
  EMAIL_APP_PASSWORD=your-microsoft-app-password
  ```

### 3. Yahoo Mail
- **域名**: yahoo.com, yahoo.co.uk, yahoo.ca
- **配置**: 使用 Yahoo 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@yahoo.com
  EMAIL_APP_PASSWORD=your-yahoo-app-password
  ```

### 4. iCloud Mail (Apple)
- **域名**: icloud.com, me.com, mac.com
- **配置**: 使用 Apple ID 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@icloud.com
  EMAIL_APP_PASSWORD=your-apple-app-password
  ```

### 5. ProtonMail
- **域名**: protonmail.com
- **配置**: 使用 ProtonMail 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@protonmail.com
  EMAIL_APP_PASSWORD=your-protonmail-app-password
  ```

### 6. Zoho Mail
- **域名**: zoho.com
- **配置**: 使用 Zoho 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@zoho.com
  EMAIL_APP_PASSWORD=your-zoho-app-password
  ```

### 7. AOL Mail
- **域名**: aol.com
- **配置**: 使用 AOL 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@aol.com
  EMAIL_APP_PASSWORD=your-aol-app-password
  ```

### 8. Yandex Mail
- **域名**: yandex.com, yandex.ru
- **配置**: 使用 Yandex 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@yandex.com
  EMAIL_APP_PASSWORD=your-yandex-app-password
  ```

### 9. Mail.ru
- **域名**: mail.ru
- **配置**: 使用 Mail.ru 应用密码
- **环境变量**:
  ```
  EMAIL_USER=your-email@mail.ru
  EMAIL_APP_PASSWORD=your-mailru-app-password
  ```

### 10. 自定义 SMTP
对于其他邮箱服务商，可以使用自定义 SMTP 配置：
- **环境变量**:
  ```
  EMAIL_USER=your-email@yourdomain.com
  EMAIL_APP_PASSWORD=your-smtp-password
  SMTP_HOST=your-smtp-server.com
  SMTP_PORT=587
  SMTP_SECURE=false
  ```

## 应用密码设置指南

### Gmail 应用密码设置
1. 登录 Gmail 账户
2. 进入"Google 账户设置" → "安全性"
3. 启用"两步验证"
4. 生成"应用密码"（选择"邮件"）
5. 使用生成的应用密码作为 `EMAIL_APP_PASSWORD`

### Outlook 应用密码设置
1. 登录 Microsoft 账户
2. 进入"安全性" → "高级安全选项"
3. 启用"两步验证"
4. 创建"应用密码"
5. 使用生成的应用密码作为 `EMAIL_APP_PASSWORD`

### Yahoo 应用密码设置
1. 登录 Yahoo 账户
2. 进入"账户安全" → "生成应用密码"
3. 选择"邮件"应用
4. 使用生成的应用密码作为 `EMAIL_APP_PASSWORD`

### iCloud 应用密码设置
1. 登录 Apple ID 账户
2. 进入"安全性" → "应用专用密码"
3. 生成新的应用密码
4. 使用生成的应用密码作为 `EMAIL_APP_PASSWORD`

## 部署配置

在 Vercel 项目设置中添加以下环境变量：

```
EMAIL_USER=your-email@domain.com
EMAIL_APP_PASSWORD=your-app-password
NEXT_PUBLIC_WEB_BASE_URL=https://shortdramini.com
```

## 测试建议

1. 使用 Gmail 进行初始测试（最稳定）
2. 确保应用密码正确配置
3. 检查邮箱的垃圾邮件文件夹
4. 验证码有效期为 5 分钟

## 故障排除

### 常见错误
- **"Failed to send verification code"**: 检查环境变量配置
- **"Invalid credentials"**: 验证应用密码是否正确
- **"Connection timeout"**: 检查网络连接和 SMTP 设置

### 调试步骤
1. 检查环境变量是否正确设置
2. 验证应用密码是否有效
3. 确认邮箱服务商支持 SMTP
4. 检查防火墙和网络限制
