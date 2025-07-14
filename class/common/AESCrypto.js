const crypto = require('crypto');
const CommonFun = require('./CommonFun');

function AESCrypto() {
    // 加密方法
    this.encrypt = function (plainText, key, iv) {
        try {
            if (CommonFun.isStringEmpty(iv)) {
                iv = key.substring(0, 16);
            }
            const cipher = crypto.createCipheriv(
                'aes-256-cbc',
                key,
                iv,
                { padding: 'PKCS7' } // 使用PKCS7填充
            );

            let encrypted = cipher.update(plainText, 'utf8', 'base64');
            encrypted += cipher.final('base64');

            return encrypted;
        } catch (err) {
            //throw new Error(`加密失败: ${err.message}`);
            return "";
        }
    }

    // 解密方法
    this.decrypt = function (encryptedText, key, iv) {
        try {
            if (CommonFun.isStringEmpty(iv)) {
                iv = key.substring(0, 16);
            }
            const decipher = crypto.createDecipheriv(
                'aes-256-cbc',
                key,
                iv,
                { padding: 'PKCS7' } // 使用PKCS7填充
            );

            let decrypted = decipher.update(encryptedText, 'base64', 'utf8');
            decrypted += decipher.final('utf8');

            return decrypted;
        } catch (err) {
            // throw new Error(`解密失败: ${err.message}`);
            return "";
        }
    }

}

module.exports = new AESCrypto();