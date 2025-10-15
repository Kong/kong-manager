<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        ApiRuler Manager
    <#elseif section = "form">
    <div id="kc-form">
      <div id="kc-form-wrapper">
        <div class="login-logo">
          <img src="${url.resourcesPath}/img/apiruler-logo.svg" alt="ApiRuler Logo" class="logo-image">
        </div>

        <div class="login-header">
          <h2>ApiRuler Manager</h2>
          <p>Lütfen giriş yapın</p>
        </div>

        <#if message?has_content && (message.type != 'warning' || !isAppInitiatedAction??)>
          <div class="error-message alert-${message.type}">
            <#if message.type = 'success'><span class="pficon pficon-ok"></span></#if>
            <#if message.type = 'error'><span class="pficon pficon-error-circle-o"></span></#if>
            <span class="kc-feedback-text">${kcSanitize(message.summary)?no_esc}</span>
          </div>
        </#if>

        <form id="kc-form-login" onsubmit="login.disabled = true; return true;" action="${url.loginAction}" method="post" class="login-form">
          <div class="form-group">
            <label for="username" class="${properties.kcLabelClass!}">
              <#if !realm.loginWithEmailAllowed>Kullanıcı Adı<#elseif !realm.registrationEmailAsUsername>Kullanıcı Adı veya E-posta<#else>E-posta</#if>
            </label>

            <input
              tabindex="1"
              id="username"
              class="form-input ${properties.kcInputClass!}"
              name="username"
              value="${(login.username!'')}"
              type="text"
              autofocus
              autocomplete="off"
              placeholder="Kullanıcı adınızı girin"
              aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
            />

            <#if messagesPerField.existsError('username','password')>
              <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
              </span>
            </#if>
          </div>

          <div class="form-group">
            <label for="password" class="${properties.kcLabelClass!}">Şifre</label>

            <input
              tabindex="2"
              id="password"
              class="form-input ${properties.kcInputClass!}"
              name="password"
              type="password"
              autocomplete="off"
              placeholder="Şifrenizi girin"
              aria-invalid="<#if messagesPerField.existsError('username','password')>true</#if>"
            />

            <#if usernameHidden?? && messagesPerField.existsError('username','password')>
              <span id="input-error" class="${properties.kcInputErrorMessageClass!}" aria-live="polite">
                ${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}
              </span>
            </#if>
          </div>

          <div class="form-actions">
            <input type="hidden" id="id-hidden-input" name="credentialId" <#if auth.selectedCredential?has_content>value="${auth.selectedCredential}"</#if>/>
            <button
              tabindex="4"
              class="login-button"
              name="login"
              id="kc-login"
              type="submit"
            >
              Giriş Yap
            </button>
          </div>

          <#if realm.resetPasswordAllowed>
            <div class="form-footer">
              <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="forgot-password-link">Şifremi Unuttum</a>
            </div>
          </#if>
        </form>
      </div>
    </div>
    </#if>

</@layout.registrationLayout>
