<h2><?php _e('Administration générale', 'studiogram'); ?></h2>
<table class="form-table">
    <tr>
        <td>
            <input type="checkbox" name="superadmin" id="superadmin" <?= ($this->superadmins && in_array($user->ID, $this->superadmins)) ? 'checked' : '' ?> class="regular-text" />
            <span class="description"><?php _e("Donner un accès de super administrateur à l'utilisateur", 'studiogram'); ?></span>
        </td>
    </tr>
    <tr>
        <td>
            <input type="checkbox" name="superadmincustom" id="superadmincustom" <?= ($this->superadmincustom && in_array($user->ID, $this->superadmincustom)) ? 'checked' : '' ?> class="regular-text" />
            <span class="description"><?php _e("Donner un accès à la customisation", 'studiogram'); ?></span>
        </td>
    </tr>
</table>