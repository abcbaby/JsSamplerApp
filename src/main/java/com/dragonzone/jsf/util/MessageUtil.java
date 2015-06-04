package com.dragonzone.jsf.util;

import java.text.MessageFormat;
import java.util.Iterator;
import java.util.List;
import java.util.Locale;
import java.util.ResourceBundle;

import javax.faces.application.FacesMessage;
import javax.faces.application.FacesMessage.Severity;
import javax.faces.context.FacesContext;
import javax.faces.validator.ValidatorException;

public class MessageUtil {
    
    private MessageUtil() {
    }
    
    private static final String DEFAULT_APPLICATION_RESOURCE_BUNDLE = "msg"; // must match what is faces-config.xml
    
    private static String getResourceBundleName(String resourceBundleName) {
        return resourceBundleName == null ? DEFAULT_APPLICATION_RESOURCE_BUNDLE : resourceBundleName;
    }

    public static boolean hasWarnOrHigherMessage() {
        boolean hasError = false;
        FacesContext context = FacesContext.getCurrentInstance();
        List<FacesMessage> msgList = context.getMessageList();
        for (FacesMessage fm : msgList) {
            if (fm.getSeverity() == FacesMessage.SEVERITY_WARN
                    || fm.getSeverity() == FacesMessage.SEVERITY_ERROR
                    || fm.getSeverity() == FacesMessage.SEVERITY_FATAL) {
                hasError = true;
                break;
            }
        }

        return hasError;
    }

    /** SOME HELPER METHODS **/
    private static void addMessageWithSeverity(String message, Severity severity) {
        FacesContext context = FacesContext.getCurrentInstance();
        FacesMessage facesMsg = new FacesMessage(severity, message, message);
        context.addMessage(null, facesMsg);
    }

    public static void addMessage(FacesMessage facesMessage) {
        FacesContext context = FacesContext.getCurrentInstance();
        context.addMessage(null, facesMessage);
    }

    private static String getMessageStringFromBundle(String bundle, String key) {
        FacesContext context = FacesContext.getCurrentInstance();
        return context.getApplication().getResourceBundle(context, bundle).getString(key);
    }
    
    /**
     * Adds message to faces context by String
     * @param message
     */
    public static void addErrorMessageByString(String message) {
        addMessageWithSeverity(message, FacesMessage.SEVERITY_ERROR);
    }

    /**
     * add message to faces context by message key
     * @param messageKey
     */
    public static void addErrorMessageByPropertyString(String messageKey) {
        addMessageWithSeverity(getMessageStringFromBundle(DEFAULT_APPLICATION_RESOURCE_BUNDLE, messageKey), FacesMessage.SEVERITY_ERROR);
    }

    /**
     * add message to faces context by message key and resource file
     * @param messageKey
     * @param resourceFile
     */
    public static void addErrorMessageByPropertyString(String messageKey, String resourceFile) {
        addMessageWithSeverity(getMessageStringFromBundle(resourceFile, messageKey), FacesMessage.SEVERITY_ERROR);
    }

    /**
     * adds confirmation message to faces context
     * @param messageKey
     */
    public static void addInfoMessageByPropertyString(String messageKey) {
        addMessageWithSeverity(getMessageStringFromBundle(DEFAULT_APPLICATION_RESOURCE_BUNDLE, messageKey), FacesMessage.SEVERITY_INFO);
    }
    
            /**
     * Adds confirmation message to faces context by string.
     * @param message
     */
    public static void addInfoMessageByString(String message) {
        addMessageWithSeverity(message, FacesMessage.SEVERITY_INFO);
    }
    
        /**
     * add message to faces context by message key and resource file
     * @param messageKey
     * @param resourceFile
     */
    public static void addInfoMessageByPropertyString(String messageKey, String resourceFile) {
        addMessageWithSeverity(getMessageStringFromBundle(resourceFile, messageKey), FacesMessage.SEVERITY_INFO);
    }
    
    /**
     * adds warning message to faces context by string
     * @param message
     */
    public static void addWarnMessageByString(String message) {
        addMessageWithSeverity(message, FacesMessage.SEVERITY_WARN);
    }

    /**
     * adds warning message by message key
     * @param messageKey
     */
    public static void addWarnMessagebyPropertyString(String messageKey) {
        addMessageWithSeverity(getMessageStringFromBundle(DEFAULT_APPLICATION_RESOURCE_BUNDLE, messageKey), FacesMessage.SEVERITY_WARN);
    }

    public static void addWarnMessagebyPropertyString(String messageKey, String resourceBundleName) {
        addMessageWithSeverity(getMessageStringFromBundle(getResourceBundleName(resourceBundleName), messageKey), FacesMessage.SEVERITY_WARN);
    }

    public static void clearMessages(Severity severity) {
        Iterator<FacesMessage> iterable = FacesContext.getCurrentInstance().getMessages();
        while (iterable.hasNext()) {
            FacesMessage fm = iterable.next();
            if (severity == null || severity.getOrdinal() == fm.getSeverity().getOrdinal()) {
                iterable.remove();
            }
        }
    }

    public static void clearMessages() {
        clearMessages(null);
    }
    
    public static boolean hasMessages() {
        Iterator<FacesMessage> iterable = FacesContext.getCurrentInstance().getMessages();
        while (iterable.hasNext()) {
            return true;
        }
        return false;
    }

    /**
     * Gets FacesMessage.SEVERITY_ERRORmessage from faces context by message key; Formats by params 
     * @param messageKey
     * @param params
     * @return formatted FacesMessage
     */
    public static FacesMessage getMesageByString(String messageKey, String[] params) {
        FacesContext context = FacesContext.getCurrentInstance();
        ResourceBundle rb = context.getApplication().getResourceBundle(context, DEFAULT_APPLICATION_RESOURCE_BUNDLE);
        String result = rb.getString(messageKey);
        MessageFormat format = new MessageFormat(result);
        result = format.format(params);
        FacesMessage message = new FacesMessage();
        message.setDetail(result);
        message.setSummary(result);
        message.setSeverity(FacesMessage.SEVERITY_ERROR);
        return message;
    }

    /**
     * Gets message from faces context by message key from resourceBundleName parameter.  
     * Formats by an array of Strings
     * @param messageKey
     * @param params
     * @param resourceBundleName
     * @return formatted FacesMessage
     */
    public static FacesMessage getMesageByString(String messageKey, String[] params, String resourceBundleName) {
        FacesContext context = FacesContext.getCurrentInstance();
        ResourceBundle rb = context.getApplication().getResourceBundle(context, getResourceBundleName(resourceBundleName));
        String result = rb.getString(messageKey);
        MessageFormat format = new MessageFormat(result);
        result = format.format(params);
        FacesMessage message = new FacesMessage();
        message.setDetail(result);
        message.setSummary(result);
        message.setSeverity(FacesMessage.SEVERITY_ERROR);
        return message;
    }
    
    /**
     * Get FacesMessage with severity level set
     * @param message
     * @param severity if null, will set to FacesMessage.SEVERITY_ERROR
     * @return 
     */
    public static FacesMessage getMessageWithSeverity(String message, Severity severity) {
        return  new FacesMessage(severity == null ? FacesMessage.SEVERITY_ERROR : severity, message, message);
    }
    
    /**
     * Get FacesMessage with severity level set to FacesMessage.SEVERITY_ERROR
     * @param message
     * @return 
     */
    public static FacesMessage getMessage(String message) {
        return  new FacesMessage(FacesMessage.SEVERITY_ERROR, message, message);
    }
    
    public static FacesMessage getMesageByString(String messageKey, String[] params, String resourceBundleName, Severity severityLevel) {
        FacesMessage message = getMesageByString(messageKey, params, getResourceBundleName(resourceBundleName));
        message.setSeverity(severityLevel);
        return message;
    }

    public static String getResourceBundleLocaleValue(String messageKey, String resourceBundleName) {
        FacesContext context = FacesContext.getCurrentInstance();
        Locale locale = context.getViewRoot().getLocale();
        ResourceBundle rb = ResourceBundle.getBundle(getResourceBundleName(resourceBundleName), locale);
        return rb.getString(messageKey);
    }

    public static String getResourceBundleValue(String messageKey, String resourceBundleName) {
        FacesContext context = FacesContext.getCurrentInstance();
        ResourceBundle rb = context.getApplication().getResourceBundle(context, getResourceBundleName(resourceBundleName));
        return rb.getString(messageKey);
    }

    public static void throwNew(FacesMessage message) {
        throw new ValidatorException(message);

    }

    public static void handle(String msg, String[] params, String bundle, boolean throwsException) {
        FacesMessage message = MessageUtil.getMesageByString(
                msg,
                params,
                bundle);

        if (throwsException) {
            throwNew(message);
        }

        MessageUtil.addWarnMessageByString(message.getSummary());
    }
}
