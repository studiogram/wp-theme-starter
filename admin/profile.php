<h2><?php _e('Administration générale', 'studiogram'); ?></h2>
<table class="form-table">
    <tr>
        <td>
            <input type="checkbox" name="superadmin" id="superadmin" <?= ($this->superadmins && in_array($user->ID, $this->superadmins)) ? 'checked' : '' ?> class="regular-text" />
            <span class="description"><?php _e("accès super administrateur", 'studiogram'); ?></span>
        </td>
    </tr>
</table>